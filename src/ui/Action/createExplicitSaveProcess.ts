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
export const createExplicitSaveProcess = <Input, Success, Rejection, Observed = never>({
  execute,
  recovery,
}: {
  execute: Action<Input, Success, Rejection>
  recovery?: {
    inspect: () => Promise<Observed>
    matches: (observed: Observed, submitted: Input) => boolean
  }
}) => {
  let snapshot: ExplicitSaveSnapshot<Observed> = {
    busy: false,
    inspection: { kind: "idle" },
  }
  let closed = false
  const listeners = new Set<() => void>()

  const publish = (next: ExplicitSaveSnapshot<Observed>) => {
    snapshot = next
    if (!closed) listeners.forEach((listener) => {
      try {
        listener()
      } catch {
        // A broken presentation subscriber must not block remote execution.
      }
    })
  }

  const onInspectionChange = (inspection: Inspection<Observed>) => {
    publish({ ...snapshot, inspection })
  }

  const inspectionPart = recovery
    ? createInspectionRecovery<Input, Observed>({
        ...recovery,
        onChange: onInspectionChange,
      })
    : null

  const getSnapshot = () => {
    return snapshot
  }

  const subscribe = (listener: () => void) => {
    if (closed) return () => undefined
    listeners.add(listener)
    const unsubscribe = () => {
      listeners.delete(listener)
    }
    return unsubscribe
  }

  const submit = async (input: Input): Promise<ActionOutcome<Success, Rejection> | null> => {
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

  const inspect = async (input: Input): Promise<Inspection<Observed>> => {
    if (closed || !inspectionPart || snapshot.busy) return snapshot.inspection
    return inspectionPart.run(input)
  }

  const invalidateInspection = () => {
    inspectionPart?.invalidate()
  }

  const close = () => {
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
