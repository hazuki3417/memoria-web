import type { Action, ActionOutcome } from "./actionOutcome"
import {
  createInspectionRecovery,
  type InspectionResult,
} from "./createInspectionRecovery"

export type Inspection<Observed> = InspectionResult<Observed>

export type ExplicitSaveSnapshot<Observed> = Readonly<{
  busy: boolean
  inspection: Inspection<Observed>
}>

/**
 * Factory for explicit-save processes.
 *
 * The Action and optional inspection policy are injected; single-flight,
 * exception uncertainty, recovery invalidation and teardown are composed
 * consistently. The process never interprets application-specific reasons.
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
  const listeners = new Set<() => void>()

  function publish(next: ExplicitSaveSnapshot<Observed>) {
    snapshot = next
    if (!closed) listeners.forEach((listener) => {
      try {
        listener()
      } catch {
        // A broken presentation subscriber must not block remote execution.
      }
    })
  }

  function onInspectionChange(inspection: Inspection<Observed>) {
    publish({ ...snapshot, inspection })
  }

  const inspectionPart = recovery
    ? createInspectionRecovery<Input, Observed>({
        ...recovery,
        onChange: onInspectionChange,
      })
    : null

  function getSnapshot() {
    return snapshot
  }

  function subscribe(listener: () => void) {
    if (closed) return () => undefined
    listeners.add(listener)
    function unsubscribe() {
      listeners.delete(listener)
    }
    return unsubscribe
  }

  async function submit(input: Input): Promise<ActionOutcome<Success, Rejection> | null> {
    if (closed || snapshot.busy) return null
    inspectionPart?.invalidate()
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
  }

  async function inspect(input: Input): Promise<Inspection<Observed>> {
    if (closed || !inspectionPart || snapshot.busy) return snapshot.inspection
    return inspectionPart.run(input)
  }

  function invalidateInspection() {
    inspectionPart?.invalidate()
  }

  function close() {
    closed = true
    inspectionPart?.close()
    listeners.clear()
    // A remote in-flight mutation is not cancelled by closing the view.
  }

  return {
    getSnapshot,
    subscribe,
    submit,
    inspect,
    invalidateInspection,
    close,
  }
}

export type ExplicitSaveProcess<Input, Success, Rejection, Observed> =
  ReturnType<typeof createExplicitSaveProcess<Input, Success, Rejection, Observed>>
