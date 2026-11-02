import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

/**
 * Serializes writes, coalesces edits and debounces requests.
 * dispose({ flush: true }) sends pending changes before a component unmounts.
 * Keep this controller outside the component to survive navigation.
 */
export function createPreferencesSaveQueue(
  save: (patch: UserPreferencesPatch) => Promise<UserPreferences>,
  onSaved: (preferences: UserPreferences, attempted: UserPreferencesPatch) => void,
  onError: (error: unknown, attempted: UserPreferencesPatch) => void,
  delayMs = 400,
  onStateChange?: (state: "pending" | "saving" | "saved" | "attention") => void,
) {
  let pending: UserPreferencesPatch = {}
  let running = false
  let stopped = false
  let paused = false
  let timer: ReturnType<typeof setTimeout> | undefined

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  async function drain() {
    if (running || stopped || paused || Object.keys(pending).length === 0) return
    running = true
    onStateChange?.("saving")
    try {
      while (!stopped && Object.keys(pending).length > 0) {
        const patch = pending
        pending = {}
        try {
          const saved = await save(patch)
          if (!stopped) {
            onSaved(saved, patch)
            onStateChange?.(Object.keys(pending).length ? "saving" : "saved")
          }
        } catch (error) {
          // Preserve unsuccessful edits, without overwriting newer values.
          pending = { ...patch, ...pending }
          paused = true
          if (!stopped) {
            onError(error, patch)
            onStateChange?.("attention")
          }
          break
        }
      }
    } finally {
      running = false
    }
  }

  function schedule() {
    clearTimer()
    timer = setTimeout(() => {
      timer = undefined
      void drain()
    }, delayMs)
  }

  return {
    enqueue(patch: UserPreferencesPatch) {
      if (stopped) return
      pending = { ...pending, ...patch }
      onStateChange?.(running ? "saving" : "pending")
      if (!paused) schedule()
    },
    flush({ manual = true }: { manual?: boolean } = {}) {
      clearTimer()
      if (manual) paused = false
      return drain()
    },
    getPending() {
      return { ...pending }
    },
    clearPending() {
      clearTimer()
      pending = {}
      paused = false
    },
    dispose({ flush = false }: { flush?: boolean } = {}) {
      if (flush) {
        clearTimer()
        void drain()
        return
      }
      stopped = true
      clearTimer()
      pending = {}
    },
  }
}
