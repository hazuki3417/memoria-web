export type InspectionResult<Observed> =
  | { kind: "idle" | "checking" | "failed" }
  | { kind: "matches" | "differs"; value: Observed }

/** 現在値の照会と入力との比較を担い、古い照会結果の反映を防ぐRecovery部品を生成する。 */
export const createInspectionRecovery = <Input, Observed>({
  inspect,
  matches,
  onChange,
}: {
  inspect: () => Promise<Observed>
  matches: (observed: Observed, input: Input) => boolean
  onChange?: (snapshot: InspectionResult<Observed>) => void
}) => {
  let state: InspectionResult<Observed> = { kind: "idle" }
  let revision = 0
  let closed = false

  const publish = (value: InspectionResult<Observed>) => {
    if (closed) return
    state = value
    try {
      onChange?.(state)
    } catch {
      // 購読側の例外によって照会結果を変更しない。
    }
  }

  const getSnapshot = () => {
    return state
  }

  const invalidate = () => {
    revision += 1
    if (state.kind !== "idle") publish({ kind: "idle" })
  }

  const run = async (input: Input): Promise<InspectionResult<Observed>> => {
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
  }

  const close = () => {
    closed = true
    revision += 1
  }

  return { getSnapshot, invalidate, run, close }
}
