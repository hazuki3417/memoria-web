import type { Action } from "./action"
import type { ActionOutcome } from "./actionOutcome"

/** 自動保存の一回の実行結果と、実行中に追加された未送信変更。 */
export type AutoSaveAttempt<Patch, Success, Rejection> = Readonly<{
  attempted: Patch
  outcome: ActionOutcome<Success, Rejection>
  unsent: Patch | null
}>

/** 自動保存の変更受付と終了時Flushを提供するQueueの公開契約。 */
export type AutoSaveQueue<Patch> = Readonly<{
  enqueue(patch: Patch): void
  close(): Promise<void>
}>

type AutoSaveQueueConfig<Patch, Success, Rejection> = {
  execute: Action<Patch, Success, Rejection>
  onResult?: (result: AutoSaveAttempt<Patch, Success, Rejection>) => void
  delayMs?: number
}

/** 変更の合流・Debounce・直列実行と終了時Flushを担う、自動保存Queueを生成する。 */
export const createAutoSaveQueue = <
  Patch extends object,
  Success,
  Rejection,
>({
  execute,
  onResult,
  delayMs = 400,
}: AutoSaveQueueConfig<Patch, Success, Rejection>): AutoSaveQueue<Patch> => {
  let pending: Patch | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let running: Promise<void> | null = null
  let closed = false
  let halted = false
  let closing: Promise<void> | null = null

  const clearTimer = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  const drain = (): Promise<void> => {
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
          // 例外だけでは遠隔操作の未成立を判断できない。
          outcome = { kind: "unknown" }
        }

        if (outcome.kind !== "success") halted = true

        const unsent = pending
        try {
          onResult?.({ attempted, outcome, unsent })
        } catch {
          // 結果通知の失敗によって遠隔操作の結果を変更しない。
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

  const enqueue = (patch: Patch) => {
    if (closed || halted) return
    // Patchの各キーは独立した項目として扱い、後から受けた値を優先する。
    pending = { ...pending, ...patch }
    if (running) return

    clearTimer()
    timer = setTimeout(() => {
      timer = undefined
      void drain()
    }, delayMs)
  }

  const close = (): Promise<void> => {
    if (closing) return closing
    closed = true
    // 実行中の操作は中断せず、確定した成功の場合のみ残りを送信する。
    closing = drain()
    return closing
  }

  return { enqueue, close }
}
