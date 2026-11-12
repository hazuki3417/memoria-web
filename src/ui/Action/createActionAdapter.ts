import type { Action, ActionOutcome } from "./actionOutcome"

/** 実行処理と結果分類を注入し、ドメインや通信方式に依存しないActionを生成する。 */
export const createActionAdapter = <Input, Response, Success, Rejection>({
  execute,
  classify,
  classifyError,
  afterSuccess,
}: {
  execute: (input: Input) => Promise<Response>
  classify: (response: Response) => ActionOutcome<Success, Rejection>
  
  classifyError?: (error: unknown) => ActionOutcome<Success, Rejection>
  
  afterSuccess?: (success: Success, input: Input) => void | Promise<void>
}): Action<Input, Success, Rejection> => {
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
        
      }
    }
    return outcome
  }

  return run
}
