import type { Action, ActionOutcome } from "./actionOutcome"

export type AutoSaveAttempt<Patch, Success, Rejection> = Readonly<{
  attempted: Patch
  outcome: ActionOutcome<Success, Rejection>
  /** Changes accepted during the attempt, not yet submitted. */
  unsent: Patch | null
}>

export type AutoSaveQueue<Patch> = Readonly<{
  enqueue(patch: Patch): void
  /** Stops accepting input and tries to submit pending changes once. */
  close(): Promise<void>
}>

/**
 * Short-lived, scoped queue for best-effort autosave. Callers bind execute to
 * one User/Community and keep it valid for the lifetime of in-flight writes.
 * Never pass callbacks that update React state after unmount.
 */
export function createAutoSaveQueue<
  Patch extends object,
  Success,
  Rejection,
>({
  execute,
  onResult,
  delayMs = 400,
}: {
  execute: Action<Patch, Success, Rejection>
  onResult?: (result: AutoSaveAttempt<Patch, Success, Rejection>) => void
  delayMs?: number
}): AutoSaveQueue<Patch> {
  let pending: Patch | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let running: Promise<void> | null = null
  let closed = false
  let halted = false
  let closing: Promise<void> | null = null

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  function drain(): Promise<void> {
    clearTimer()
    if (running) return running
    if (halted || !pending) return Promise.resolve()

    const work = async () => {
      while (pending && !halted) {
        const attempted = pending
        pending = null

        let outcome: ActionOutcome<Success, Rejection>
        try {
          outcome = await execute(attempted)
        } catch {
          // An unclassified exception cannot prove non-execution.
          outcome = { kind: "unknown" }
        }

        if (outcome.kind !== "success") halted = true

        const unsent = pending
        // Observation must not change whether the remote operation succeeded.
        try {
          onResult?.({ attempted, outcome, unsent })
        } catch {
          // Presentation/observation failures are not mutation failures.
        }

        if (halted) {
          pending = null
          break
        }
      }
    }

    running = work().finally(() => {
      running = null
    })
    return running
  }

  return {
    enqueue(patch) {
      if (closed || halted) return
      // A shallow merge is intentional: each patch key represents one field.
      pending = { ...pending, ...patch }
      if (running) return

      clearTimer()
      timer = setTimeout(() => {
        timer = undefined
        void drain()
      }, delayMs)
    },

    close() {
      if (closing) return closing
      closed = true
      // Do not cancel an in-flight attempt. Its success permits the pending
      // patch to drain; rejection/unknown stops further writes.
      closing = drain()
      return closing
    },
  }
}
