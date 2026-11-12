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

describe("createAutoSaveQueue", () => {
  it("combines pending fields and prefers the latest value", async () => {
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

  it("flushes pending changes on close without waiting for debounce", async () => {
    vi.useFakeTimers()
    const execute = vi.fn(async (_patch: Patch) => success())
    const queue = createAutoSaveQueue({ execute })

    queue.enqueue({ color: "blue" })
    await queue.close()
    expect(execute).toHaveBeenCalledExactlyOnceWith({ color: "blue" })
    await vi.runAllTimersAsync()
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it("drains changes accepted during an in-flight attempt in order", async () => {
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
    ["rejected", rejected()],
    ["unknown", unknown()],
  ]

  it.each(nonSuccess)("stops on %s without submitting later patches", async (_label, result) => {
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

  it("treats a thrown error as unknown and never automatically retries", async () => {
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

  it("is idempotent while closing, and ignores further edits", async () => {
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

  it("does not turn a successful write into failure if observation throws", async () => {
    const execute = vi.fn(async (_patch: Patch) => success())
    const onResult = vi.fn(() => {
      throw new Error("view went away")
    })
    const queue = createAutoSaveQueue({ execute, onResult })
    queue.enqueue({ color: "red" })
    await queue.close()
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it("does not mutate the submitted patch when later fields change", async () => {
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
