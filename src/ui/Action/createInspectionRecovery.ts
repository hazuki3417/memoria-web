export type InspectionResult<Observed> =
  | { kind: "idle" | "checking" | "failed" }
  | { kind: "matches" | "differs"; value: Observed }

/** A reusable, scope-limited read/reconciliation part, independent of React. */
export function createInspectionRecovery<Input, Observed>({
  inspect,
  matches,
  onChange,
}: {
  inspect: () => Promise<Observed>
  matches: (observed: Observed, input: Input) => boolean
  onChange?: (snapshot: InspectionResult<Observed>) => void
}) {
  let state: InspectionResult<Observed> = { kind: "idle" }
  let revision = 0
  let closed = false

  function publish(value: InspectionResult<Observed>) {
    if (closed) return
    state = value
    onChange?.(state)
  }

  return {
    getSnapshot: () => state,
    invalidate() {
      revision += 1
      if (state.kind !== "idle") publish({ kind: "idle" })
    },
    async run(input: Input): Promise<InspectionResult<Observed>> {
      if (closed) return state
      const request = ++revision
      publish({ kind: "checking" })
      try {
        const value = await inspect()
        if (closed || request !== revision) return state
        publish({ kind: matches(value, input) ? "matches" : "differs", value })
      } catch {
        if (closed || request !== revision) return state
        publish({ kind: "failed" })
      }
      return state
    },
    close() {
      closed = true
      revision += 1
    },
  }
}
