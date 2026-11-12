import type { Action } from "./action"
import type { ActionOutcome } from "./actionOutcome"

export type ActionAdapterConfig<Input, Response, Success, Rejection> = {
  execute: (input: Input) => Promise<Response>
  classify: (response: Response) => ActionOutcome<Success, Rejection>
  classifyError?: (error: unknown) => ActionOutcome<Success, Rejection>
  afterSuccess?: (success: Success, input: Input) => void | Promise<void>
}

/** API固有の実行・結果判定を注入し、異なる通信手段でも共通の確定／拒否／結果不明のAction契約を利用できるようにする。 */
export const createActionAdapter = <Input, Response, Success, Rejection>({
  execute,
  classify,
  classifyError,
  afterSuccess,
}: ActionAdapterConfig<Input, Response, Success, Rejection>): Action<Input, Success, Rejection> => {
  const run = async (input: Input): Promise<ActionOutcome<Success, Rejection>> => {
    let result: Response
    try {
      result = await execute(input)
    } catch (error) {
      if (!classifyError) return { kind: "unknown" }
      try {
        return classifyError(error)
      } catch {
        return { kind: "unknown" }
      }
    }

    let outcome: ActionOutcome<Success, Rejection>
    try {
      outcome = classify(result)
    } catch {
      return { kind: "unknown" }
    }

    if (outcome.kind === "success" && afterSuccess) {
      // 後続の同期失敗によって確定済みの操作結果を変更しない。
      try {
        void Promise.resolve(afterSuccess(outcome.value, input)).catch(() => undefined)
      } catch {
        // 成功後の同期処理はActionの成立判定から独立している。
      }
    }
    return outcome
  }

  return run
}
