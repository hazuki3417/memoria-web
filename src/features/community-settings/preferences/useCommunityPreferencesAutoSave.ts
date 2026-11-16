"use client"

import { useEffect, useRef, useState } from "react"
import { createAutoSaveQueue, type AutoSaveQueue } from "@/ui/Action"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import type { SaveStatusState } from "@/components/SaveStatus"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"
import {
  isCommunityAccentColor,
  type CommunityPreferencesDraft,
  type CommunityPreferencesPatch,
  type CommunityPreferencesValues,
} from "./communityPreferences"
import type {
  CommunityPreferencesSaveOperations,
  CommunityPreferencesSaveOutcome,
  CommunityPreferencesSaveRejection,
} from "./communityPreferencesSaveOutcome"

type Failure = "rejected" | "blocked" | "unknown" | null
type Snapshot = Readonly<{
  confirmed: CommunityPreferencesValues | null
  draft: CommunityPreferencesDraft | null
  status: SaveStatusState
  failure: Failure
  blockedFeedback: { title: string; description: string } | null
  validation: { fieldErrors: Record<string, string>; formError: boolean } | null
  observedMatches: boolean
  inspected: boolean
}>

export type CommunityPreferencesAccentPreview = {
  preview: (color: string) => number
  release: (owner: number) => void
}

type Attempt = { patch: CommunityPreferencesPatch; revision: number }
type Lifetime = {
  operations: CommunityPreferencesSaveOperations
  preview: CommunityPreferencesAccentPreview | undefined
  snapshot: Snapshot
  queue: AutoSaveQueue<Attempt> | null
  previewOwner: number | null
  revision: number
  inspectionGeneration: number
  closed: boolean
  running: boolean
}

const initialSnapshot: Snapshot = {
  confirmed: null,
  draft: null,
  status: "idle",
  failure: null,
  blockedFeedback: null,
  validation: null,
  observedMatches: false,
  inspected: false,
}

const normalize = (value: string) => value.toUpperCase()

const releasePreview = (owner: Lifetime) => {
  if (owner.previewOwner !== null) {
    owner.preview?.release(owner.previewOwner)
    owner.previewOwner = null
  }
}

/** Ready ViewのFormが利用する短命な自動保存状態・Queue・明示Recoveryを所有する。 */
export const useCommunityPreferencesAutoSave = (
  initialAccent: string,
  operations?: CommunityPreferencesSaveOperations,
  preview?: CommunityPreferencesAccentPreview,
) => {
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot)
  const ownerRef = useRef<Lifetime | null>(null)

  const emit = (owner: Lifetime, patch: Partial<Snapshot>) => {
    if (owner.closed || ownerRef.current !== owner) return
    owner.snapshot = { ...owner.snapshot, ...patch }
    setSnapshot(owner.snapshot)
  }

  useEffect(() => {
    if (!operations) return
    // 保存先とPreviewの対象を画面Lifetimeごとに固定する。
    // Strict Modeの再setupでも閉じたQueueや以前の表示状態を再利用しない。
    const owner: Lifetime = {
      operations,
      preview,
      snapshot: initialSnapshot,
      queue: null,
      previewOwner: null,
      revision: 0,
      inspectionGeneration: 0,
      closed: false,
      running: false,
    }
    ownerRef.current = owner
    setSnapshot(initialSnapshot)
    return () => {
      owner.closed = true
      owner.inspectionGeneration += 1
      if (ownerRef.current === owner) ownerRef.current = null
      releasePreview(owner)
      // 離脱後も有効Pendingの送信を試行するが、画面Stateは更新しない。
      void owner.queue?.close()
    }
  }, [operations, preview])

  useEffect(() => {
    const owner = ownerRef.current
    if (!owner || !isCommunityAccentColor(initialAccent) ||
        owner.snapshot.confirmed !== null || owner.snapshot.draft !== null) return
    const values = { accentColor: normalize(initialAccent) }
    owner.snapshot = { ...owner.snapshot, confirmed: values, draft: values }
    setSnapshot(owner.snapshot)
  }, [initialAccent, operations, preview])

  const makeQueue = (owner: Lifetime, delayMs = 400): AutoSaveQueue<Attempt> => {
    const shouldExecute = (attempt: Attempt) =>
      attempt.revision === owner.revision && owner.snapshot.draft !== null &&
      isCommunityAccentColor(owner.snapshot.draft.accentColor) &&
      normalize(owner.snapshot.draft.accentColor) === attempt.patch.accentColor

    const execute = async (attempt: Attempt): Promise<CommunityPreferencesSaveOutcome> => {
      owner.running = true
      if (!owner.closed) emit(owner, { status: "saving" })
      try {
        const outcome = await owner.operations.save(attempt.patch)
        if (outcome.kind !== "success") return outcome
        const color = normalize(outcome.value.accentColor)
        if (!isCommunityAccentColor(color)) return { kind: "unknown" }
        return { kind: "success", value: { accentColor: color } }
      } catch {
        return { kind: "unknown" }
      } finally {
        owner.running = false
      }
    }

    return createAutoSaveQueue<Attempt, CommunityPreferencesValues, CommunityPreferencesSaveRejection>({
      delayMs,
      shouldExecute,
      execute,
      onResult: ({ attempted, outcome, unsent }) => {
        if (owner.closed) return
        if (outcome.kind === "success") {
          const color = outcome.value.accentColor
          const pendingDraft = owner.snapshot.draft
          const latest = attempted.revision === owner.revision
          if (latest) releasePreview(owner)
          emit(owner, {
            confirmed: { accentColor: color },
            status: !latest || unsent || (pendingDraft && normalize(pendingDraft.accentColor) !== color)
              ? "pending" : "saved",
            validation: null,
          })
          return
        }
        const reason = outcome.kind === "rejected" ? outcome.reason : null
        const failure: Failure = !reason ? "unknown" : reason.kind === "blocked" ? "blocked" : "rejected"
        emit(owner, {
          status: "attention",
          failure,
          blockedFeedback: reason?.kind === "blocked"
            ? getCommunityBlockedFeedback(reason.error, "Community設定") : null,
          validation: reason?.kind === "validation"
            ? resolveFormFailureValidation(reason.violations, Object.keys(attempted.patch)) : null,
          observedMatches: false,
          inspected: false,
        })
      },
    })
  }

  const enqueue = (owner: Lifetime, patch: CommunityPreferencesPatch, delayMs = 400) => {
    if (!owner.queue) owner.queue = makeQueue(owner, delayMs)
    owner.queue.enqueue({ patch, revision: owner.revision })
  }

  const edit = (draft: CommunityPreferencesDraft) => {
    const owner = ownerRef.current
    if (!owner || owner.closed) return
    const value = draft.accentColor
    owner.revision += 1
    owner.inspectionGeneration += 1
    emit(owner, { draft, validation: null, observedMatches: false, inspected: false })
    if (!isCommunityAccentColor(value)) {
      releasePreview(owner)
      emit(owner, { status: owner.snapshot.failure ? "attention" : owner.running ? "saving" : "pending" })
      return
    }
    if (owner.snapshot.failure) {
      // 停止したQueueの自動再送は行わない。
      emit(owner, { status: "attention" })
      return
    }
    const color = normalize(value)
    if (color === owner.snapshot.confirmed?.accentColor && !owner.running) {
      releasePreview(owner)
      emit(owner, { status: "idle" })
      return
    }
    if (owner.preview) owner.previewOwner = owner.preview.preview(color)
    emit(owner, { status: owner.running ? "saving" : "pending" })
    enqueue(owner, { accentColor: color })
  }

  const inspect = async () => {
    const owner = ownerRef.current
    if (!owner || owner.closed || owner.snapshot.failure !== "unknown") return
    const generation = ++owner.inspectionGeneration
    const draftAtStart = owner.snapshot.draft
    emit(owner, { inspected: false, observedMatches: false })
    try {
      const server = normalize((await owner.operations.observe()).accentColor)
      if (owner.closed || generation !== owner.inspectionGeneration ||
          owner.snapshot.draft !== draftAtStart || owner.snapshot.failure !== "unknown") return
      emit(owner, {
        inspected: true,
        observedMatches: Boolean(draftAtStart && isCommunityAccentColor(draftAtStart.accentColor) &&
          normalize(draftAtStart.accentColor) === server),
      })
    } catch {
      if (!owner.closed && generation === owner.inspectionGeneration &&
          owner.snapshot.draft === draftAtStart && owner.snapshot.failure === "unknown")
        emit(owner, { inspected: false, observedMatches: false })
    }
  }

  const confirmObservation = () => {
    const owner = ownerRef.current
    if (!owner || owner.closed || owner.snapshot.failure !== "unknown" ||
        !owner.snapshot.observedMatches || !owner.snapshot.draft ||
        !isCommunityAccentColor(owner.snapshot.draft.accentColor)) return
    const color = normalize(owner.snapshot.draft.accentColor)
    owner.operations.confirm({ accentColor: color })
    releasePreview(owner)
    emit(owner, {
      confirmed: { accentColor: color }, status: "idle", failure: null,
      blockedFeedback: null, validation: null, inspected: false, observedMatches: false,
    })
    owner.queue = null
  }

  const retry = () => {
    const owner = ownerRef.current
    if (!owner || owner.closed || !owner.snapshot.failure || owner.snapshot.failure === "blocked" ||
        !owner.snapshot.draft || !isCommunityAccentColor(owner.snapshot.draft.accentColor) ||
        (owner.snapshot.failure === "unknown" && !owner.snapshot.inspected)) return
    const color = normalize(owner.snapshot.draft.accentColor)
    owner.revision += 1
    owner.queue = null
    emit(owner, {
      failure: null, blockedFeedback: null, validation: null,
      inspected: false, observedMatches: false, status: "pending",
    })
    if (owner.preview) owner.previewOwner = owner.preview.preview(color)
    enqueue(owner, { accentColor: color }, 0)
  }

  const discard = () => {
    const owner = ownerRef.current
    if (!owner || owner.closed || owner.running) return
    owner.revision += 1
    owner.inspectionGeneration += 1
    releasePreview(owner)
    emit(owner, {
      draft: owner.snapshot.confirmed, status: "idle", failure: null,
      blockedFeedback: null, validation: null, inspected: false, observedMatches: false,
    })
    owner.queue = null
  }

  return {
    snapshot,
    edit,
    inspect,
    confirmObservation,
    retry,
    discard,
    canResave: Boolean(snapshot.draft && isCommunityAccentColor(snapshot.draft.accentColor)),
  }
}
