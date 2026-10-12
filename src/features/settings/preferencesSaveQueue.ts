import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

/**
 * Serialize account preference writes so a slower response cannot overwrite
 * a later user choice. Pending edits are coalesced into the next request.
 *
 * The caller owns optimistic UI state and rollback/feedback behavior.
 */
export function createPreferencesSaveQueue(
  save: (patch: UserPreferencesPatch) => Promise<UserPreferences>,
  onSaved: (preferences: UserPreferences) => void,
  onError: (error: unknown, attempted: UserPreferencesPatch) => void,
) {
  let pending: UserPreferencesPatch = {}
  let running = false
  let stopped = false

  async function drain() {
    if (running || stopped) return
    running = true
    try {
      while (!stopped && Object.keys(pending).length > 0) {
        const patch = pending
        pending = {}
        try {
          const saved = await save(patch)
          if (!stopped) onSaved(saved)
        } catch (error) {
          if (!stopped) onError(error, patch)
        }
      }
    } finally {
      running = false
    }
  }

  return {
    enqueue(patch: UserPreferencesPatch) {
      if (stopped) return
      pending = { ...pending, ...patch }
      void drain()
    },
    dispose() {
      stopped = true
      pending = {}
    },
  }
}
