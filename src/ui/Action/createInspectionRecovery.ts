export type InspectionResult<Observed> =
  | { kind: "idle" | "checking" | "failed" }
  | { kind: "matches" | "differs"; value: Observed }

/** 照会値とAction入力を比較するRecoveryの共通契約。 */
export type InspectionRecoveryPolicy<Input, Observed> = {
  inspect: () => Promise<Observed>
  matches: (observed: Observed, input: Input) => boolean
}

type InspectionRecoveryConfig<Input, Observed> =
  InspectionRecoveryPolicy<Input, Observed> & {
    onChange?: (snapshot: InspectionResult<Observed>) => void
  }

/** 保存結果が不明な場合に現在値との一致を利用者が確認できるよう、照会・比較・古い照会の失効を提供する。 */
export const createInspectionRecovery = <Input, Observed>({
  inspect,
  matches,
  onChange,
}: InspectionRecoveryConfig<Input, Observed>) => {
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
