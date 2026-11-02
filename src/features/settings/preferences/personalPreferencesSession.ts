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
  let inspectionGeneration = 0
  const locallyConfirmedKeys = new Set<keyof UserPreferences>()

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
        for (const key of Object.keys(attempted) as Array<
          keyof UserPreferences
        >) {
          // Only fields present in this Mutation are authoritative.
          Object.assign(nextConfirmed, { [key]: confirmed[key] })
          locallyConfirmedKeys.add(key)
          if (nextDraft[key] === confirmed[key]) delete nextDraft[key]
        }
        emit({ confirmed: nextConfirmed, draftPatch: nextDraft, failure: null })
      },
      (error) => {
        const failure: PreferencesFailure =
          typeof error === "object" &&
          error !== null &&
          "kind" in error &&
          error.kind === "blocked"
            ? "blocked"
            : isUnknown(error)
              ? "unknown"
              : "retryable"
        emit({
          failure,
          saveStatus: "attention",
          inspected: false,
          observedMatches: false,
        })
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
      return () => {
        subscribers.delete(listener)
      }
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
        if (locallyConfirmedKeys.has(key)) {
          // An authoritative Query has now echoed the locally confirmed value.
          // Older snapshots must not roll it back before this point.
          if (current[key] === snapshot.confirmed[key])
            locallyConfirmedKeys.delete(key)
          else continue
        }
        if (!(key in pending)) {
          Object.assign(refreshed, { [key]: current[key] })
        }
      }
      if (
        (Object.keys(refreshed) as Array<keyof UserPreferences>).some(
          (key) => refreshed[key] !== snapshot.confirmed?.[key],
        )
      )
        emit({ confirmed: refreshed })
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
      // A new raw Draft invalidates any observation made before this edit.
      emit({ accentDraft: value, inspected: false, observedMatches: false })
    },
    async inspect() {
      if (snapshot.failure !== "unknown" || !inspectServer) return
      const draftAtStart = snapshot.draftPatch
      const rawAtStart = snapshot.accentDraft
      const generation = ++inspectionGeneration
      // Do not permit confirmation against an observation being refreshed.
      inspectedValue = null
      emit({ inspected: false, observedMatches: false })
      try {
        const current = await inspectServer()
        if (
          generation !== inspectionGeneration ||
          snapshot.failure !== "unknown" ||
          snapshot.draftPatch !== draftAtStart ||
          snapshot.accentDraft !== rawAtStart
        )
          return
        inspectedValue = current
        const pending = { ...queue?.getPending(), ...snapshot.draftPatch }
        const observedMatches =
          Object.keys(pending).length > 0 &&
          (Object.keys(pending) as Array<keyof UserPreferences>).every(
            (key) => current[key] === pending[key],
          ) &&
          (snapshot.accentDraft === null ||
            /^#[0-9a-fA-F]{6}$/.test(snapshot.accentDraft))
        emit({ inspected: true, observedMatches })
      } catch {
        if (
          generation !== inspectionGeneration ||
          snapshot.failure !== "unknown" ||
          snapshot.draftPatch !== draftAtStart ||
          snapshot.accentDraft !== rawAtStart
        )
          return
        inspectedValue = null
        emit({ inspected: false, observedMatches: false })
      }
    },
    confirmObservation() {
      if (
        snapshot.failure !== "unknown" ||
        !snapshot.observedMatches ||
        !inspectedValue
      )
        return
      const pending = { ...ensureQueue().getPending(), ...snapshot.draftPatch }
      const confirmed = { ...(snapshot.confirmed ?? inspectedValue) }
      // The observation establishes only the fields being recovered. Unrelated
      // locally confirmed fields must not be rolled back by an older Query.
      for (const key of Object.keys(pending) as Array<keyof UserPreferences>) {
        Object.assign(confirmed, { [key]: inspectedValue[key] })
        locallyConfirmedKeys.add(key)
      }
      ensureQueue().clearPending()
      emit({
        confirmed,
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
      if (
        snapshot.accentDraft !== null &&
        !/^#[0-9a-fA-F]{6}$/.test(snapshot.accentDraft)
      )
        return
      if (snapshot.failure === "unknown" && !snapshot.inspected) return
      inspectedValue = null
      emit({
        failure: null,
        saveStatus: "pending",
        observedMatches: false,
        inspected: false,
      })
      void ensureQueue().flush()
    },
    discard() {
      if (snapshot.saveStatus === "saving") return
      ensureQueue().clearPending()
      inspectedValue = null
      emit({
        failure: null,
        draftPatch: {},
        accentDraft: snapshot.confirmed?.personalAccentColor ?? null,
        saveStatus: "idle",
        observedMatches: false,
        inspected: false,
        discardRevision: snapshot.discardRevision + 1,
      })
    },
  }
}
