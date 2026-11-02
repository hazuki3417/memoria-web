import { createPreferencesSaveQueue } from "./preferencesSaveQueue"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"
import type { SaveStatusState } from "@/components/SaveStatus"

export type PreferencesFailure = "unknown" | "retryable" | "blocked" | null
export type PreferencesSessionSnapshot = Readonly<{
  confirmed: UserPreferences | null
  draftPatch: UserPreferencesPatch
  accentDraft: string | null
  saveStatus: SaveStatusState
  failure: PreferencesFailure
  inspected: boolean
  observedMatches: boolean
  discardRevision: number
}>

const initial: PreferencesSessionSnapshot = {
  confirmed: null,
  draftPatch: {},
  accentDraft: null,
  saveStatus: "idle",
  failure: null,
  inspected: false,
  observedMatches: false,
  discardRevision: 0,
}

type Save = (patch: UserPreferencesPatch) => Promise<UserPreferences>
type Inspect = () => Promise<UserPreferences>

const isUnknown = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) return true
  if ("networkError" in error && error.networkError) return true
  if ("kind" in error && error.kind === "blocked") return false
  if ("graphQLErrors" in error) return false
  return true
}

/**
 * Session-scoped owner: the preferences view is only a subscriber.
 * Controller persists across SPA routes, never across browser reload.
 */
export function createPersonalPreferencesSession() {
  let snapshot: PreferencesSessionSnapshot = initial
  const subscribers = new Set<() => void>()
  let save: Save | undefined
  let inspectServer: Inspect | undefined
  let queue: ReturnType<typeof createPreferencesSaveQueue> | null = null
  let inspectedValue: UserPreferences | null = null

  const emit = (change: Partial<PreferencesSessionSnapshot>) => {
    snapshot = { ...snapshot, ...change }
    for (const listener of subscribers) listener()
  }

  const ensureQueue = () => {
    if (queue) return queue
    queue = createPreferencesSaveQueue(
      async (patch) => {
        if (!save) throw new Error("Personal Preferences save unavailable")
        return save(patch)
      },
      (confirmed, attempted) => {
        const nextConfirmed = { ...(snapshot.confirmed ?? confirmed) }
        const nextDraft = { ...snapshot.draftPatch }
        for (const key of Object.keys(attempted) as Array<keyof UserPreferences>) {
          // Only fields present in this Mutation are authoritative.
          ;(nextConfirmed as Record<string, unknown>)[key] = confirmed[key]
          if (nextDraft[key] === confirmed[key]) delete nextDraft[key]
        }
        emit({ confirmed: nextConfirmed, draftPatch: nextDraft, failure: null })
      },
      (error) => {
        const failure: PreferencesFailure =
          typeof error === "object" && error !== null &&
          "kind" in error && error.kind === "blocked"
            ? "blocked"
            : isUnknown(error) ? "unknown" : "retryable"
        emit({ failure, saveStatus: "attention", inspected: false, observedMatches: false })
      },
      400,
      (state) => {
        emit({ saveStatus: snapshot.failure ? "attention" : state })
      },
    )
    return queue
  }

  return {
    subscribe(listener: () => void) {
      subscribers.add(listener)
      return () => { subscribers.delete(listener) }
    },
    getSnapshot(): PreferencesSessionSnapshot {
      return snapshot
    },
    configure(nextSave: Save, nextInspect?: Inspect) {
      save = nextSave
      inspectServer = nextInspect
      ensureQueue()
    },
    hydrate(current: UserPreferences) {
      if (!snapshot.confirmed) {
        emit({ confirmed: current })
        return
      }
      // Refresh only untouched fields. Never overwrite an edited field.
      if (snapshot.failure) return
      const refreshed = { ...snapshot.confirmed }
      const pending = { ...snapshot.draftPatch, ...queue?.getPending() }
      for (const key of Object.keys(current) as Array<keyof UserPreferences>) {
        if (!(key in pending)) {
          ;(refreshed as Record<string, unknown>)[key] = current[key]
        }
      }
      if (
        (Object.keys(refreshed) as Array<keyof UserPreferences>).some(
          (key) => refreshed[key] !== snapshot.confirmed?.[key],
        )
      ) emit({ confirmed: refreshed })
    },
    edit(patch: UserPreferencesPatch) {
      emit({
        draftPatch: { ...snapshot.draftPatch, ...patch },
        observedMatches: false,
        inspected: false,
      })
      // The queue is paused after a failure, but must retain newer user edits.
      // No automatic retry occurs until the user explicitly requests it.
      ensureQueue().enqueue(patch)
    },
    editAccentDraft(value: string) {
      emit({ accentDraft: value })
    },
    async inspect() {
      if (snapshot.failure !== "unknown" || !inspectServer) return
      try {
        const current = await inspectServer()
        inspectedValue = current
        const pending = { ...queue?.getPending(), ...snapshot.draftPatch }
        const observedMatches = Object.keys(pending).length > 0 &&
          (Object.keys(pending) as Array<keyof UserPreferences>).every(
            (key) => current[key] === pending[key],
          ) &&
          (snapshot.accentDraft === null ||
            /^#[0-9a-fA-F]{6}$/.test(snapshot.accentDraft))
        emit({ inspected: true, observedMatches })
      } catch {
        inspectedValue = null
        emit({ inspected: false, observedMatches: false })
      }
    },
    confirmObservation() {
      if (snapshot.failure !== "unknown" || !snapshot.observedMatches ||
        !inspectedValue) return
      ensureQueue().clearPending()
      emit({
        confirmed: inspectedValue,
        draftPatch: {},
        failure: null,
        saveStatus: "idle",
        observedMatches: false,
        inspected: false,
      })
      inspectedValue = null
    },
    retry() {
      if (!snapshot.failure || snapshot.failure === "blocked") return
      if (snapshot.failure === "unknown" && !snapshot.inspected) return
      inspectedValue = null
      emit({ failure: null, saveStatus: "pending",
        observedMatches: false, inspected: false })
      void ensureQueue().flush()
    },
    discard() {
      if (snapshot.saveStatus === "saving") return
      ensureQueue().clearPending()
      inspectedValue = null
      emit({
        failure: null, draftPatch: {},
        accentDraft: snapshot.confirmed?.personalAccentColor ?? null,
        saveStatus: "idle",
        observedMatches: false, inspected: false,
        discardRevision: snapshot.discardRevision + 1,
      })
    },
  }
}
