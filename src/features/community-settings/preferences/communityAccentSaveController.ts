import { createAutoSaveQueue, type AutoSaveQueue, type ActionOutcome } from "@/ui/Action"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import type { SaveStatusState } from "@/components/SaveStatus"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"

export type AccentFailure = "rejected" | "blocked" | "unknown" | null
export type AccentSnapshot = Readonly<{
  confirmed: string | null
  draft: string | null
  status: SaveStatusState
  failure: AccentFailure
  blockedFeedback: { title: string; description: string } | null
  validation: { fieldErrors: Record<string, string>; formError: boolean } | null
  observedMatches: boolean
  inspected: boolean
}>

type Operations = {
  save: (color: string) => Promise<string>
  observe: () => Promise<string>
  confirm: (color: string) => void
  preview: (color: string) => number
  release: (owner: number) => void
}
type Patch = { accentColor: string; revision: number }
type SaveRejection = { kind: "blocked" | "rejected"; error: unknown }
type SaveSuccess = { color: string | null }
const hex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)
const normalized = (value: string) => value.toUpperCase()

const initialSnapshot: AccentSnapshot = {
  confirmed: null,
  draft: null,
  status: "idle",
  failure: null,
  blockedFeedback: null,
  validation: null,
  observedMatches: false,
  inspected: false,
}

/**
 * One Ready Community Preferences view owns this controller and its short-lived Queue.
 * Only the in-flight action and its fixed Apollo/Community closure may outlive the view.
 * Neither draft nor failure is restored on a later visit.
 */
export function createCommunityAccentSaveController() {
  let snapshot: AccentSnapshot = initialSnapshot
  let operations: Operations | null = null
  let queue: AutoSaveQueue<Patch> | null = null
  let previewOwner: number | null = null
  let revision = 0
  let inspectionGeneration = 0
  let closed = false
  let running = false
  const listeners = new Set<() => void>()

  const update = (patch: Partial<AccentSnapshot>) => {
    snapshot = { ...snapshot, ...patch }
    if (!closed) for (const listener of listeners) listener()
  }
  const releasePreview = () => {
    if (previewOwner !== null) {
      operations?.release(previewOwner)
      previewOwner = null
    }
  }

  const makeQueue = (delayMs = 400): AutoSaveQueue<Patch> =>
    createAutoSaveQueue<Patch, SaveSuccess, SaveRejection>({
      delayMs,
      execute: async (attempt): Promise<ActionOutcome<SaveSuccess, SaveRejection>> => {
        // A newer incomplete draft or an explicit discard invalidates a queued color.
        // The generic Queue still sees a successful no-op, without sending a stale Mutation.
        if (attempt.revision !== revision || snapshot.draft === null ||
            !hex(snapshot.draft) || normalized(snapshot.draft) !== attempt.accentColor)
          return { kind: "success", value: { color: null } }
        running = true
        update({ status: "saving" })
        try {
          if (!operations) return { kind: "unknown" }
          const confirmed = normalized(await operations.save(attempt.accentColor))
          if (!hex(confirmed)) return { kind: "unknown" }
          return { kind: "success", value: { color: confirmed } }
        } catch (error) {
          const failure = classifySettingsSaveFailure(error)
          if (failure === "unknown") return { kind: "unknown" }
          return { kind: "rejected", reason: {
            kind: failure === "blocked" ? "blocked" : "rejected", error,
          } }
        } finally {
          running = false
        }
      },
      onResult: ({ attempted, outcome, unsent }) => {
        if (outcome.kind === "success") {
          if (!outcome.value.color) return
          const color = outcome.value.color
          // Mutation success is authoritative, even if its view has unmounted.
          // Apollo/cache commit occurs inside operations.save, never in UI state.
          if (closed) return
          const pendingDraft = snapshot.draft
          const latest = attempted.revision === revision
          if (latest) releasePreview()
          update({
            confirmed: color,
            status: !latest || unsent || (pendingDraft && normalized(pendingDraft) !== color)
              ? "pending" : "saved",
            validation: null,
          })
          return
        }
        if (closed) return
        const failure: AccentFailure =
          outcome.kind === "unknown" ? "unknown" : outcome.reason.kind
        const error = outcome.kind === "rejected" ? outcome.reason.error : null
        const kind = outcome.kind === "rejected" ? classifySettingsSaveFailure(error) : "unknown"
        // Failed selections remain visible as Preview; no implicit rollback.
        update({
          status: "attention",
          failure,
          blockedFeedback: failure === "blocked" ? getCommunityBlockedFeedback(error, "Community設定") : null,
          validation: kind === "validation"
            ? resolveFormFailureValidation(getSettingsInputViolations(error), ["accentColor"])
            : null,
          observedMatches: false,
          inspected: false,
        })
      },
    })

  const enqueue = (color: string, delayMs = 400) => {
    if (!queue) queue = makeQueue(delayMs)
    queue.enqueue({ accentColor: color, revision })
  }

  return {
    getSnapshot: () => snapshot,
    isClosed: () => closed,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    configure(next: Operations) { operations = next },
    initialize(serverColor: string) {
      if (!hex(serverColor)) return
      if (snapshot.confirmed !== null || snapshot.draft !== null) return
      update({ confirmed: normalized(serverColor), draft: normalized(serverColor) })
    },
    edit(value: string) {
      if (closed) return
      revision += 1
      inspectionGeneration += 1
      update({ draft: value, validation: null, observedMatches: false, inspected: false })
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
      if (color === snapshot.confirmed && !running) {
        releasePreview()
        update({ status: "idle" })
        return
      }
      if (operations) previewOwner = operations.preview(color)
      update({ status: running ? "saving" : "pending" })
      enqueue(color)
    },
    async inspect() {
      if (closed || snapshot.failure !== "unknown" || !operations) return
      const generation = ++inspectionGeneration
      const draftAtStart = snapshot.draft
      update({ inspected: false, observedMatches: false })
      try {
        const server = normalized(await operations.observe())
        if (closed || generation !== inspectionGeneration || snapshot.draft !== draftAtStart ||
            snapshot.failure !== "unknown") return
        update({
          inspected: true,
          observedMatches: Boolean(draftAtStart && hex(draftAtStart) &&
            normalized(draftAtStart) === server),
        })
      } catch {
        if (!closed && generation === inspectionGeneration &&
            snapshot.draft === draftAtStart && snapshot.failure === "unknown")
          update({ inspected: false, observedMatches: false })
      }
    },
    confirmObservation() {
      if (closed || snapshot.failure !== "unknown" || !snapshot.observedMatches ||
          !snapshot.draft || !hex(snapshot.draft)) return
      const color = normalized(snapshot.draft)
      operations?.confirm(color)
      releasePreview()
      update({
        confirmed: color, status: "idle", failure: null,
        blockedFeedback: null, validation: null, inspected: false, observedMatches: false,
      })
      queue = null
    },
    retry() {
      if (closed || !snapshot.failure || snapshot.failure === "blocked" ||
          !snapshot.draft || !hex(snapshot.draft) ||
          (snapshot.failure === "unknown" && !snapshot.inspected)) return
      const color = normalized(snapshot.draft)
      revision += 1
      queue = null
      update({
        failure: null, blockedFeedback: null, validation: null,
        inspected: false, observedMatches: false, status: "pending",
      })
      if (operations) previewOwner = operations.preview(color)
      enqueue(color, 0)
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
