import type { Action } from "./action"
import type { ActionOutcome } from "./actionOutcome"
import {
  createInspectionRecovery,
  type InspectionResult,
  type InspectionRecoveryPolicy,
} from "./createInspectionRecovery"

export type Inspection<Observed> = InspectionResult<Observed>

export type ExplicitSaveSnapshot<Observed> = Readonly<{
  busy: boolean
  inspection: Inspection<Observed>
}>

export type ExplicitSaveProcessConfig<Input, Success, Rejection, Observed = never> = {
  execute: Action<Input, Success, Rejection>
  recovery?: InspectionRecoveryPolicy<Input, Observed>
}

/** 明示保存で必要な重複送信防止・結果不明後の照会・終了処理を共通化し、各Featureが同じ保存プロセスを構成できるようにする。 */
export const createExplicitSaveProcess = <Input, Success, Rejection, Observed = never>({
  execute,
  recovery,
}: ExplicitSaveProcessConfig<Input, Success, Rejection, Observed>) => {
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
        // 表示側の購読処理の例外が遠隔操作を妨げないようにする。
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
      // 分類できない例外は操作の不成立を証明しない。
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
    // 画面終了によって実行中の遠隔操作を取り消したことにはしない。
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
