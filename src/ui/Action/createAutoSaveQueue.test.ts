import { afterEach, describe, expect, it, vi } from "vitest"
import { createAutoSaveQueue } from "./createAutoSaveQueue"
import type { ActionOutcome } from "./actionOutcome"

type Patch = { color?: string; size?: string }
type Result = ActionOutcome<void, string>

const success = (): Result => ({ kind: "success", value: undefined })
const rejected = (): Result => ({ kind: "rejected", reason: "validation" })
const unknown = (): Result => ({ kind: "unknown" })

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("自動保存Queue（createAutoSaveQueue）", () => {
  it("送信待ちの変更を項目単位で合流し、同じ項目は最後の値で保存する", async () => {
    vi.useFakeTimers()
    const execute = vi.fn(async (_patch: Patch) => success())
    const queue = createAutoSaveQueue({ execute, delayMs: 400 })

    queue.enqueue({ color: "red" })
    queue.enqueue({ size: "large" })
    queue.enqueue({ color: "blue" })

    await vi.advanceTimersByTimeAsync(399)
    expect(execute).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenCalledWith({ color: "blue", size: "large" })
    await queue.close()
  })

  it("終了時にはDebounceの待機をせず、未送信変更を送信する", async () => {
    vi.useFakeTimers()
    const execute = vi.fn(async (_patch: Patch) => success())
    const queue = createAutoSaveQueue({ execute })

    queue.enqueue({ color: "blue" })
    await queue.close()
    expect(execute).toHaveBeenCalledExactlyOnceWith({ color: "blue" })
    await vi.runAllTimersAsync()
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it("保存中に受けた変更は、先行保存の成功後に順番どおり送信する", async () => {
    vi.useFakeTimers()
    const first = deferred<Result>()
    const execute = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async () => success())
    const queue = createAutoSaveQueue<Patch, void, string>({ execute })

    queue.enqueue({ color: "red" })
    await vi.advanceTimersByTimeAsync(400)
    queue.enqueue({ color: "blue" })
    queue.enqueue({ size: "large" })
    expect(execute).toHaveBeenCalledTimes(1)

    const closing = queue.close()
    first.resolve(success())
    await closing
    expect(execute).toHaveBeenCalledTimes(2)
    expect(execute).toHaveBeenNthCalledWith(1, { color: "red" })
    expect(execute).toHaveBeenNthCalledWith(2, {
      color: "blue",
      size: "large",
    })
  })

  const nonSuccess: Array<[string, Result]> = [
    ["拒否が確定した", rejected()],
    ["成否が不明な", unknown()],
  ]

  it.each(nonSuccess)("%s場合は後続の変更を送信しない", async (_label, result) => {
    vi.useFakeTimers()
    const first = deferred<Result>()
    const execute = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async () => success())
    const onResult = vi.fn()
    const queue = createAutoSaveQueue<Patch, void, string>({
      execute,
      onResult,
    })

    queue.enqueue({ color: "red" })
    await vi.advanceTimersByTimeAsync(400)
    queue.enqueue({ size: "large" })
    const closing = queue.close()
    first.resolve(result)
    await closing

    expect(execute).toHaveBeenCalledTimes(1)
    expect(onResult).toHaveBeenCalledWith({
      attempted: { color: "red" },
      outcome: result,
      unsent: { size: "large" },
    })
    queue.enqueue({ color: "blue" })
    await vi.runAllTimersAsync()
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it("実行時に例外が発生した場合は結果不明とし、自動で再送しない", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("lost response"))
    const onResult = vi.fn()
    const queue = createAutoSaveQueue<Patch, void, string>({
      execute,
      onResult,
    })
    queue.enqueue({ color: "blue" })

    await queue.close()
    expect(execute).toHaveBeenCalledTimes(1)
    expect(onResult).toHaveBeenCalledWith({
      attempted: { color: "blue" },
      outcome: { kind: "unknown" },
      unsent: null,
    })
  })

  it("終了処理を重複実行せず、終了開始後の変更は受け付けない", async () => {
    const first = deferred<Result>()
    const execute = vi.fn(() => first.promise)
    const queue = createAutoSaveQueue<Patch, void, string>({ execute })
    queue.enqueue({ color: "red" })

    const one = queue.close()
    const two = queue.close()
    expect(one).toBe(two)
    queue.enqueue({ size: "large" })
    first.resolve(success())
    await one
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it("結果通知で例外が発生しても、保存成功の結果を変更しない", async () => {
    const execute = vi.fn(async (_patch: Patch) => success())
    const onResult = vi.fn(() => {
      throw new Error("view went away")
    })
    const queue = createAutoSaveQueue({ execute, onResult })
    queue.enqueue({ color: "red" })
    await queue.close()
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it("送信後に別の変更を受け付けても送信済みPatchを変更しない", async () => {
    vi.useFakeTimers()
    const first = deferred<Result>()
    const seen: Patch[] = []
    const execute = vi.fn((patch: Patch) => {
      seen.push(patch)
      return seen.length === 1 ? first.promise : Promise.resolve(success())
    })
    const queue = createAutoSaveQueue<Patch, void, string>({ execute })
    queue.enqueue({ color: "red" })
    await vi.advanceTimersByTimeAsync(400)
    queue.enqueue({ color: "blue" })
    first.resolve(success())
    await queue.close()
    expect(seen).toEqual([{ color: "red" }, { color: "blue" }])
  })
})
