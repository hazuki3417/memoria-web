import type { Action, ActionOutcome } from "./actionOutcome"

export type Inspection<Observed> =
  | { kind: "idle" | "checking" | "failed" }
  | { kind: "matches" | "differs"; value: Observed }

export type ExplicitSaveSnapshot<Observed> = Readonly<{
  busy: boolean
  inspection: Inspection<Observed>
}>

/**
 * Reusable, framework-independent composition of a single-flight Action and
 * an optional authoritative read. The factory owns ordering/lifetime; callers
 * inject domain-specific execution, comparison and presentation.
 */
export function createExplicitSaveProcess<Input, Success, Rejection, Observed = never>({
  execute,
  recovery,
}: {
  execute: Action<Input, Success, Rejection>
  recovery?: {
    inspect: () => Promise<Observed>
    matches: (observed: Observed, submitted: Input) => boolean
  }
}) {
  let snapshot: ExplicitSaveSnapshot<Observed> = {
    busy: false,
    inspection: { kind: "idle" },
  }
  let closed = false
  let inspectionVersion = 0
  const listeners = new Set<() => void>()

  function publish(next: ExplicitSaveSnapshot<Observed>) {
    snapshot = next
    if (!closed) listeners.forEach((listener) => listener())
  }

  function invalidateInspection() {
    inspectionVersion += 1
    if (!closed && snapshot.inspection.kind !== "idle") {
      publish({ ...snapshot, inspection: { kind: "idle" } })
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      if (closed) return () => undefined
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async submit(input: Input): Promise<ActionOutcome<Success, Rejection> | null> {
      if (closed || snapshot.busy) return null
      invalidateInspection()
      publish({ ...snapshot, busy: true })
      let outcome: ActionOutcome<Success, Rejection>
      try {
        outcome = await execute(input)
      } catch {
        // An unclassified exception cannot prove a remote write failed.
        outcome = { kind: "unknown" }
      }
      publish({ ...snapshot, busy: false })
      return outcome
    },
    async inspect(input: Input): Promise<Inspection<Observed>> {
      if (closed || !recovery || snapshot.busy) return snapshot.inspection
      const version = ++inspectionVersion
      publish({ ...snapshot, inspection: { kind: "checking" } })
      try {
        const value = await recovery.inspect()
        if (closed || version !== inspectionVersion) return snapshot.inspection
        const inspection: Inspection<Observed> = {
          kind: recovery.matches(value, input) ? "matches" : "differs",
          value,
        }
        publish({ ...snapshot, inspection })
        return inspection
      } catch {
        if (closed || version !== inspectionVersion) return snapshot.inspection
        const inspection: Inspection<Observed> = { kind: "failed" }
        publish({ ...snapshot, inspection })
        return inspection
      }
    },
    invalidateInspection,
    close() {
      closed = true
      inspectionVersion += 1
      listeners.clear()
      // An in-flight remote mutation is not cancelled by closing the view.
    },
  }
}

export type ExplicitSaveProcess<Input, Success, Rejection, Observed> =
  ReturnType<typeof createExplicitSaveProcess<Input, Success, Rejection, Observed>>
