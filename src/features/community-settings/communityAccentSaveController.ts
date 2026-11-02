import type { SaveStatusState } from "@/components/SaveStatus"

export type AccentFailure = "rejected" | "unknown" | null
export type AccentSnapshot = Readonly<{
  confirmed: string | null
  draft: string | null
  status: SaveStatusState
  failure: AccentFailure
  observedMatches: boolean
}>

type SaveAccent = (color: string) => Promise<string>
type ObserveAccent = () => Promise<string>
type PreviewAccent = (color: string) => number
type ReleasePreview = (owner: number) => void

type Entry = {
  snapshot: AccentSnapshot
  desired: string | null
  running: boolean
  previewOwner: number | null
  save?: SaveAccent
  observe?: ObserveAccent
  preview?: PreviewAccent
  release?: ReleasePreview
}

const emptySnapshot: AccentSnapshot = {
  confirmed: null,
  draft: null,
  status: "idle",
  failure: null,
  observedMatches: false,
}

const hex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)
const normalized = (value: string) => value.toUpperCase()

/**
 * Owns Community Accent writes for one authenticated Application Shell lifetime.
 * All entries are scoped by Community ID and all listeners are detachable.
 * A failed/unknown write never triggers an automatic retry.
 */
export function createCommunityAccentSaveController() {
  const entries = new Map<string, Entry>()
  const listeners = new Map<string, Set<() => void>>()

  const entryFor = (id: string): Entry => {
    let entry = entries.get(id)
    if (!entry) {
      entry = { snapshot: emptySnapshot, desired: null, running: false, previewOwner: null }
      entries.set(id, entry)
    }
    return entry
  }

  const notify = (id: string) => {
    for (const listener of listeners.get(id) ?? []) listener()
  }

  const update = (id: string, change: Partial<AccentSnapshot>) => {
    const entry = entryFor(id)
    entry.snapshot = { ...entry.snapshot, ...change }
    notify(id)
  }

  const clearPreview = (entry: Entry) => {
    if (entry.previewOwner !== null) {
      entry.release?.(entry.previewOwner)
      entry.previewOwner = null
    }
  }

  async function drain(id: string) {
    const entry = entryFor(id)
    if (entry.running || entry.desired === null || entry.snapshot.failure) return
    entry.running = true
    update(id, { status: "saving" })
    try {
      while (entry.desired !== null && !entry.snapshot.failure) {
        const selected = entry.desired
        entry.desired = null
        try {
          if (!entry.save) throw new Error("Accent save function unavailable")
          const confirmed = normalized(await entry.save(selected))
          if (!hex(confirmed)) throw new Error("Accent save response invalid")
          // The caller updates the Apollo confirmed cache only for successful results.
          // Newer pending edits always retain their own preview and Draft.
          update(id, {
            confirmed,
            status: entry.desired === null ? "saved" : "saving",
          })
        } catch (error) {
          const failure: AccentFailure = isUnknownAccentOutcome(error)
            ? "unknown"
            : "rejected"
          entry.desired = null
          clearPreview(entry)
          update(id, { status: "attention", failure, observedMatches: false })
          return
        }
      }
      clearPreview(entry)
      update(id, {
        status: entry.snapshot.draft !== null &&
          entry.snapshot.confirmed !== null &&
          normalized(entry.snapshot.draft) !== normalized(entry.snapshot.confirmed)
          ? "pending"
          : "saved",
      })
    } finally {
      entry.running = false
    }
  }

  return {
    getSnapshot(id: string): AccentSnapshot {
      return entryFor(id).snapshot
    },
    subscribe(id: string, listener: () => void) {
      let group = listeners.get(id)
      if (!group) {
        group = new Set()
        listeners.set(id, group)
      }
      group.add(listener)
      return () => {
        group?.delete(listener)
        if (group?.size === 0) listeners.delete(id)
      }
    },
    initialize(id: string, serverColor: string) {
      if (!hex(serverColor)) return
      const entry = entryFor(id)
      // Do not let background refetch replace an edited/failed Draft.
      if (entry.snapshot.draft !== null || entry.running || entry.snapshot.failure) return
      update(id, { confirmed: normalized(serverColor), draft: normalized(serverColor) })
    },
    configure(
      id: string,
      operations: {
        save: SaveAccent
        observe: ObserveAccent
        preview: PreviewAccent
        release: ReleasePreview
      },
    ) {
      const entry = entryFor(id)
      Object.assign(entry, operations)
    },
    edit(id: string, value: string) {
      const entry = entryFor(id)
      update(id, { draft: value, observedMatches: false })
      if (!hex(value)) {
        update(id, { status: entry.snapshot.failure ? "attention" : "pending" })
        return
      }
      if (entry.snapshot.failure) {
        // Explicit user recovery is required, especially for unknown outcomes.
        update(id, { status: "attention" })
        return
      }
      const color = normalized(value)
      if (color === entry.snapshot.confirmed && !entry.running) {
        entry.desired = null
        clearPreview(entry)
        update(id, { status: "idle" })
        return
      }
      entry.desired = color
      if (entry.preview) entry.previewOwner = entry.preview(color)
      update(id, { status: entry.running ? "saving" : "pending" })
      void drain(id)
    },
    async inspect(id: string) {
      const entry = entryFor(id)
      if (entry.snapshot.failure !== "unknown" || !entry.observe) return
      try {
        const server = normalized(await entry.observe())
        const draft = entry.snapshot.draft
        update(id, {
          // This is a current observation, not proof of the old mutation.
          observedMatches: Boolean(draft && hex(draft) && normalized(draft) === server),
        })
      } catch {
        update(id, { observedMatches: false })
      }
    },
    confirmObservation(id: string) {
      const entry = entryFor(id)
      if (entry.snapshot.failure !== "unknown" || !entry.snapshot.observedMatches) return
      clearPreview(entry)
      update(id, { failure: null, status: "idle", observedMatches: false,
        confirmed: entry.snapshot.draft ? normalized(entry.snapshot.draft) : entry.snapshot.confirmed })
    },
    retry(id: string) {
      const entry = entryFor(id)
      if (!entry.snapshot.failure || !entry.snapshot.draft || !hex(entry.snapshot.draft)) return
      // Unknown is never retried without a separate explicit user click.
      entry.desired = normalized(entry.snapshot.draft)
      update(id, { failure: null, observedMatches: false, status: "pending" })
      if (entry.preview) entry.previewOwner = entry.preview(entry.desired)
      void drain(id)
    },
    discard(id: string) {
      const entry = entryFor(id)
      // Never allow an in-flight write to be dismissed as definitively cancelled.
      if (entry.running) return
      entry.desired = null
      clearPreview(entry)
      update(id, { draft: entry.snapshot.confirmed, failure: null,
        observedMatches: false, status: "idle" })
    },
  }
}

function isUnknownAccentOutcome(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return true
  if ("networkError" in error && error.networkError) return true
  if ("name" in error && error.name === "TypeError") return true
  // An absent/invalid response cannot establish whether the server committed.
  if (error instanceof Error && /response invalid|unconfirmed/i.test(error.message))
    return true
  return !("graphQLErrors" in error)
}
