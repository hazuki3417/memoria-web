import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

/**
 * Serializes writes, coalesces edits and debounces requests.
 * dispose({ flush: true }) sends pending changes before a component unmounts.
 * Keep this controller outside the component to survive navigation.
 */
export function createPreferencesSaveQueue(
  save: (patch: UserPreferencesPatch) => Promise<UserPreferences>,
  onSaved: (preferences: UserPreferences) => void,
  onError: (error: unknown, attempted: UserPreferencesPatch) => void,
  delayMs = 400,
  onStateChange?: (state: "pending" | "saving" | "saved" | "attention") => void,
) {
  let pending: UserPreferencesPatch = {}
  let running = false
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | undefined

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  async function drain() {
    if (running || stopped) return
    running = true
    onStateChange?.("saving")
    try {
      while (!stopped && Object.keys(pending).length > 0) {
        const patch = pending
        pending = {}
        try {
          const saved = await save(patch)
          if (!stopped) {
            onSaved(saved)
            onStateChange?.(Object.keys(pending).length ? "saving" : "saved")
          }
        } catch (error) {
          // Preserve unsuccessful edits, without overwriting newer values.
          pending = { ...patch, ...pending }
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
      schedule()
    },
    flush() {
      clearTimer()
      return drain()
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
