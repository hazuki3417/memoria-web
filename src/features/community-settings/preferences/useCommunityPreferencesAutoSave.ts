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
  runningColor: string | null
  sourceAccent: string | null
  sourceReady: boolean
  previewColor: string | null
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
    owner.previewColor = null
  }
}

const showPreview = (owner: Lifetime, color: string) => {
  if (!owner.preview || owner.previewColor === color) return
  owner.previewOwner = owner.preview.preview(color)
  owner.previewColor = color
}

/** Ready ViewのFormが利用する短命な自動保存状態・Queue・明示Recoveryを所有する。 */
export const useCommunityPreferencesAutoSave = (
  initialAccent: string,
  operations?: CommunityPreferencesSaveOperations,
  preview?: CommunityPreferencesAccentPreview,
  sourceReady = true,
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
      runningColor: null,
      sourceAccent: null,
      sourceReady: false,
      previewColor: null,
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
    if (!owner || !isCommunityAccentColor(initialAccent)) return
    const color = normalize(initialAccent)
    const { confirmed, draft, failure, status } = owner.snapshot
    const sourceChanged = owner.sourceAccent !== color || (sourceReady && !owner.sourceReady)
    owner.sourceAccent = color
    owner.sourceReady = sourceReady
    if (failure || owner.runningColor !== null || status === "pending" || status === "saving") return
    // 同じ取得snapshotの再Renderでは、直前の確定値を巻き戻さない。
    // 通常Queryの応答順序はApolloが調停する。変化した正常な取得値を拒否し続けない。
    if (!sourceChanged) {
      if (confirmed?.accentColor === color && owner.operations.isAccentConfirmed?.(color)) releasePreview(owner)
      return
    }
    if (!owner.operations.isAccentConfirmed || owner.operations.isAccentConfirmed(color)) releasePreview(owner)
    const values = { accentColor: color }
    const nextDraft = draft && !isCommunityAccentColor(draft.accentColor) ? draft : values
    if (confirmed?.accentColor === color && draft === nextDraft) return
    emit(owner, { confirmed: values, draft: nextDraft })
  }, [initialAccent, operations, preview, snapshot, sourceReady])

  const makeQueue = (owner: Lifetime, delayMs = 400): AutoSaveQueue<Attempt> => {
    const shouldExecute = (attempt: Attempt) =>
      attempt.revision === owner.revision && owner.snapshot.draft !== null &&
      isCommunityAccentColor(owner.snapshot.draft.accentColor) &&
      normalize(owner.snapshot.draft.accentColor) === attempt.patch.accentColor

    const execute = async (attempt: Attempt): Promise<CommunityPreferencesSaveOutcome> => {
      owner.runningColor = attempt.patch.accentColor
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
        owner.runningColor = null
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
          const hasPending = Boolean(unsent && shouldExecute(unsent))
          // 実際に送信する後続変更がある場合だけPendingを維持する。
          // 未完成HEXはRHFのDraftとして残すが、保存予定とは区別する。
          if (!hasPending) {
            if (!owner.operations.isAccentConfirmed || owner.operations.isAccentConfirmed(color)) releasePreview(owner)
            else if (owner.previewOwner !== null) showPreview(owner, color)
          }
          const draft = hasPending || (pendingDraft && !isCommunityAccentColor(pendingDraft.accentColor))
            ? pendingDraft : { accentColor: color }
          emit(owner, {
            confirmed: { accentColor: color },
            draft,
            status: hasPending ? "pending" : "saved",
            validation: null,
          })
          return
        }
        const reason = outcome.kind === "rejected" ? outcome.reason : null
        let failure: Failure = "rejected"
        if (!reason) failure = "unknown"
        else if (reason.kind === "blocked") failure = "blocked"
        // 後続の未完成HEXで送信済み色の即時反映を消さない。
        if (owner.snapshot.draft && !isCommunityAccentColor(owner.snapshot.draft.accentColor)) {
          showPreview(owner, attempted.patch.accentColor)
        }
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
      let status: SaveStatusState = "idle"
      if (owner.snapshot.failure) status = "attention"
      else if (owner.runningColor !== null) {
        status = "saving"
        showPreview(owner, owner.runningColor)
      } else releasePreview(owner)
      emit(owner, { status })
      return
    }
    const color = normalize(value)
    if (owner.snapshot.failure) {
      // Blockedは操作停止。それ以外の有効な新規入力は表示だけ即時反映する。
      if (owner.snapshot.failure !== "blocked") showPreview(owner, color)
      // 停止したQueueの自動再送は行わない。
      emit(owner, { status: "attention" })
      return
    }
    if (color === owner.snapshot.confirmed?.accentColor && owner.runningColor === null) {
      releasePreview(owner)
      emit(owner, { status: "idle" })
      return
    }
    showPreview(owner, color)
    emit(owner, { status: owner.runningColor !== null ? "saving" : "pending" })
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
    if (!owner.operations.isAccentConfirmed || owner.operations.isAccentConfirmed(color)) releasePreview(owner)
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
    showPreview(owner, color)
    enqueue(owner, { accentColor: color }, 0)
  }

  const discard = () => {
    const owner = ownerRef.current
    if (!owner || owner.closed || owner.runningColor !== null || !owner.snapshot.failure) return
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
