import { createAutoSaveQueue, type AutoSaveQueue } from "@/ui/Action"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import type { SaveStatusState } from "@/components/SaveStatus"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"
import { isCommunityAccentColor, type CommunityPreferencesDraft, type CommunityPreferencesPatch, type CommunityPreferencesValues } from "./communityPreferences"
import type { CommunityPreferencesSaveOutcome, CommunityPreferencesSaveRejection, SaveCommunityPreferencesAction } from "./communityPreferencesSaveOutcome"

export type CommunityPreferencesFailure = "rejected" | "blocked" | "unknown" | null
export type CommunityPreferencesSnapshot = Readonly<{
  confirmed: CommunityPreferencesValues | null
  draft: CommunityPreferencesDraft | null
  status: SaveStatusState
  failure: CommunityPreferencesFailure
  blockedFeedback: { title: string; description: string } | null
  validation: { fieldErrors: Record<string, string>; formError: boolean } | null
  observedMatches: boolean
  inspected: boolean
}>

type Operations = {
  save: SaveCommunityPreferencesAction
  observe: () => Promise<CommunityPreferencesValues>
  confirm: (patch: CommunityPreferencesPatch) => void
  preview: (color: string) => number
  release: (owner: number) => void
}
type Attempt = { patch: CommunityPreferencesPatch; revision: number }
const hex = isCommunityAccentColor
const normalized = (value: string) => value.toUpperCase()

const initialSnapshot: CommunityPreferencesSnapshot = {
  confirmed: null,
  draft: null,
  status: "idle",
  failure: null,
  blockedFeedback: null,
  validation: null,
  observedMatches: false,
  inspected: false,
}

/** Ready画面単位でPreferencesのDraft・保存Queue・明示Recoveryを管理する。離脱後にDraftや失敗を復元しない。 */
export const createCommunityPreferencesSaveController = () => {
  let snapshot: CommunityPreferencesSnapshot = initialSnapshot
  let operations: Operations | null = null
  let queue: AutoSaveQueue<Attempt> | null = null
  let previewOwner: number | null = null
  let revision = 0
  let inspectionGeneration = 0
  let closed = false
  let running = false
  const listeners = new Set<() => void>()

  const update = (patch: Partial<CommunityPreferencesSnapshot>) => {
    snapshot = { ...snapshot, ...patch }
    if (!closed) for (const listener of listeners) listener()
  }
  const releasePreview = () => {
    if (previewOwner !== null) {
      operations?.release(previewOwner)
      previewOwner = null
    }
  }

  const makeQueue = (delayMs = 400): AutoSaveQueue<Attempt> =>
    createAutoSaveQueue<Attempt, CommunityPreferencesValues, CommunityPreferencesSaveRejection>({
      delayMs,
      shouldExecute: (attempt) =>
        attempt.revision === revision && snapshot.draft !== null &&
        hex(snapshot.draft.accentColor) && normalized(snapshot.draft.accentColor) === attempt.patch.accentColor,
      execute: async (attempt): Promise<CommunityPreferencesSaveOutcome> => {
        running = true
        update({ status: "saving" })
        try {
          if (!operations) return { kind: "unknown" }
          const outcome = await operations.save(attempt.patch)
          if (outcome.kind !== "success") return outcome
          const color = normalized(outcome.value.accentColor)
          if (!hex(color)) return { kind: "unknown" }
          return { kind: "success", value: { accentColor: color } }
        } catch {
          return { kind: "unknown" }
        } finally {
          running = false
        }
      },
      onResult: ({ attempted, outcome, unsent }) => {
        if (outcome.kind === "success") {
          const color = outcome.value.accentColor
          // Mutation success is authoritative, even if its view has unmounted.
          // Apollo/cache commit occurs inside operations.save, never in UI state.
          if (closed) return
          const pendingDraft = snapshot.draft
          const latest = attempted.revision === revision
          if (latest) releasePreview()
          update({
            confirmed: { accentColor: color },
            status: !latest || unsent || (pendingDraft && normalized(pendingDraft.accentColor) !== color)
              ? "pending" : "saved",
            validation: null,
          })
          return
        }
        if (closed) return
        const reason = outcome.kind === "rejected" ? outcome.reason : null
        const failure: CommunityPreferencesFailure =
          !reason ? "unknown" : reason.kind === "blocked" ? "blocked" : "rejected"
        // Failed selections remain visible as Preview; no implicit rollback.
        update({
          status: "attention",
          failure,
          blockedFeedback: reason?.kind === "blocked" ? getCommunityBlockedFeedback(reason.error, "Community設定") : null,
          validation: reason?.kind === "validation"
            ? resolveFormFailureValidation(reason.violations, Object.keys(attempted.patch))
            : null,
          observedMatches: false,
          inspected: false,
        })
      },
    })

  const enqueue = (patch: CommunityPreferencesPatch, delayMs = 400) => {
    if (!queue) queue = makeQueue(delayMs)
    queue.enqueue({ patch, revision })
  }

  return {
    getSnapshot: () => snapshot,
    isClosed: () => closed,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    configure(next: Operations) { operations = next },
    initialize(values: CommunityPreferencesValues) {
      const serverColor = values.accentColor
      if (!hex(serverColor)) return
      if (snapshot.confirmed !== null || snapshot.draft !== null) return
      update({ confirmed: { accentColor: normalized(serverColor) }, draft: { accentColor: normalized(serverColor) } })
    },
    edit(draft: CommunityPreferencesDraft) {
      const value = draft.accentColor
      if (closed) return
      revision += 1
      inspectionGeneration += 1
      update({ draft, validation: null, observedMatches: false, inspected: false })
      if (!hex(value)) {
        releasePreview()
        update({ status: snapshot.failure ? "attention" : running ? "saving" : "pending" })
        return
      }
      if (snapshot.failure) {
        // Unknown / rejected require explicit recovery: never resume a stopped Queue.
        update({ status: "attention" })
        return
      }
      const color = normalized(value)
      if (color === snapshot.confirmed?.accentColor && !running) {
        releasePreview()
        update({ status: "idle" })
        return
      }
      if (operations) previewOwner = operations.preview(color)
      update({ status: running ? "saving" : "pending" })
      enqueue({ accentColor: color })
    },
    async inspect() {
      if (closed || snapshot.failure !== "unknown" || !operations) return
      const generation = ++inspectionGeneration
      const draftAtStart = snapshot.draft
      update({ inspected: false, observedMatches: false })
      try {
        const server = normalized((await operations.observe()).accentColor)
        if (closed || generation !== inspectionGeneration || snapshot.draft !== draftAtStart ||
            snapshot.failure !== "unknown") return
        update({
          inspected: true,
          observedMatches: Boolean(draftAtStart && hex(draftAtStart.accentColor) &&
            normalized(draftAtStart.accentColor) === server),
        })
      } catch {
        if (!closed && generation === inspectionGeneration &&
            snapshot.draft === draftAtStart && snapshot.failure === "unknown")
          update({ inspected: false, observedMatches: false })
      }
    },
    confirmObservation() {
      if (closed || snapshot.failure !== "unknown" || !snapshot.observedMatches ||
          !snapshot.draft || !hex(snapshot.draft.accentColor)) return
      const color = normalized(snapshot.draft.accentColor)
      operations?.confirm({ accentColor: color })
      releasePreview()
      update({
        confirmed: { accentColor: color }, status: "idle", failure: null,
        blockedFeedback: null, validation: null, inspected: false, observedMatches: false,
      })
      queue = null
    },
    retry() {
      if (closed || !snapshot.failure || snapshot.failure === "blocked" ||
          !snapshot.draft || !hex(snapshot.draft.accentColor) ||
          (snapshot.failure === "unknown" && !snapshot.inspected)) return
      const color = normalized(snapshot.draft.accentColor)
      revision += 1
      queue = null
      update({
        failure: null, blockedFeedback: null, validation: null,
        inspected: false, observedMatches: false, status: "pending",
      })
      if (operations) previewOwner = operations.preview(color)
      enqueue({ accentColor: color }, 0)
    },
    discard() {
      if (closed || running) return
      revision += 1
      inspectionGeneration += 1
      releasePreview()
      // A halted Queue cannot resume. A queued old color is invalidated by revision.
      update({
        draft: snapshot.confirmed, status: "idle", failure: null,
        blockedFeedback: null, validation: null, inspected: false, observedMatches: false,
      })
      queue = null
    },
    close() {
      if (closed) return Promise.resolve()
      closed = true
      inspectionGeneration += 1
      releasePreview()
      listeners.clear()
      // close() initiates queued valid sends now; no React state is updated on settle.
      return queue?.close() ?? Promise.resolve()
    },
  }
}
