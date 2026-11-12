import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { createExplicitSaveProcess } from "./createExplicitSaveProcess"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe("明示保存Process（createExplicitSaveProcess）", () => {
  it("Action入力と異なる構造の照会結果を型推論し、一致判定に利用できる", async () => {
    const execute = async (input: { nickname: string }) => ({
      kind: "success" as const,
      value: input.nickname,
    })
    const inspect = async () => ({ nickname: "server", revision: 1 })
    const matches = (observed: { nickname: string; revision: number }, input: { nickname: string }) =>
      observed.nickname === input.nickname
    const process = createExplicitSaveProcess({
      execute,
      recovery: { inspect, matches },
    })

    expectTypeOf<Parameters<typeof process.submit>[0]>().toEqualTypeOf<{ nickname: string }>()
    expectTypeOf<Awaited<ReturnType<typeof process.inspect>>>().toEqualTypeOf<
      { kind: "idle" | "checking" | "failed" } |
      { kind: "matches" | "differs"; value: { nickname: string; revision: number } }
    >()
    expect(await process.inspect({ nickname: "server" })).toEqual({
      kind: "matches",
      value: { nickname: "server", revision: 1 },
    })
  })

  it("注入したActionを実行し、確定した成功結果を返す", async () => {
    const execute = vi.fn(async (input: string) => ({ kind: "success" as const, value: input }))
    const process = createExplicitSaveProcess({ execute })
    expect(await process.submit("name")).toEqual({ kind: "success", value: "name" })
    expect(execute).toHaveBeenCalledExactlyOnceWith("name")
    expect(process.getSnapshot().busy).toBe(false)
  })

  it("保存中の再送を防ぎ、後続操作を暗黙にQueue登録・再試行しない", async () => {
    const waiting = deferred<{ kind: "success"; value: string }>()
    const execute = vi.fn((_input: string) => waiting.promise)
    const process = createExplicitSaveProcess({ execute })
    const running = process.submit("first")
    expect(process.getSnapshot().busy).toBe(true)
    expect(await process.submit("second")).toBeNull()
    waiting.resolve({ kind: "success", value: "first" })
    expect(await running).toEqual({ kind: "success", value: "first" })
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it("分類できない実行例外を成否不明として返す", async () => {
    const process = createExplicitSaveProcess({
      execute: async () => { throw Error("network timeout") },
    })
    expect(await process.submit("value")).toEqual({ kind: "unknown" })
    expect(process.getSnapshot().busy).toBe(false)
  })

  it("復旧照会を注入でき、古い照会結果は無効化できる", async () => {
    const observed = deferred<string>()
    const process = createExplicitSaveProcess({
      execute: async (input: string) => ({ kind: "unknown" as const }),
      recovery: {
        inspect: () => observed.promise,
        matches: (current: string, input: string) => current === input,
      },
    })
    const reading = process.inspect("proposed")
    expect(process.getSnapshot().inspection.kind).toBe("checking")
    process.invalidateInspection()
    observed.resolve("proposed")
    await reading
    expect(process.getSnapshot().inspection).toEqual({ kind: "idle" })
  })

  it("現在値を照会して一致を判定しても、Mutation成功と断定しない", async () => {
    const process = createExplicitSaveProcess({
      execute: async (_: string) => ({ kind: "unknown" as const }),
      recovery: {
        inspect: async () => "server value",
        matches: (current: string, input: string) => current === input,
      },
    })
    expect(await process.inspect("draft")).toEqual({ kind: "differs", value: "server value" })
    expect(await process.inspect("server value")).toEqual({ kind: "matches", value: "server value" })
  })

  it("終了後は購読通知を止めるが、実行中の遠隔操作は中断しない", async () => {
    const waiting = deferred<{ kind: "success"; value: number }>()
    const listener = vi.fn()
    const process = createExplicitSaveProcess({
      execute: (_: number) => waiting.promise,
    })
    process.subscribe(listener)
    const submitted = process.submit(1)
    expect(listener).toHaveBeenCalledTimes(1)
    process.close()
    waiting.resolve({ kind: "success", value: 1 })
    expect(await submitted).toEqual({ kind: "success", value: 1 })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(await process.submit(2)).toBeNull()
  })

  it("実行状態が変化したとき購読者へ通知する", async () => {
    const events: boolean[] = []
    const process = createExplicitSaveProcess({ execute: async (input: string) =>
      ({ kind: "success" as const, value: input }) })
    const unsubscribe = process.subscribe(() => events.push(process.getSnapshot().busy))
    await process.submit("x")
    expect(events).toEqual([true, false])
    unsubscribe()
  })
})
