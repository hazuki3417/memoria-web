import { describe, expect, it, vi } from "vitest"
import { createInspectionRecovery } from "./createInspectionRecovery"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe("結果照会Recovery（createInspectionRecovery）", () => {
  it("注入した比較規則で現在値と入力の一致・不一致を判定する", async () => {
    const controller = createInspectionRecovery({
      inspect: async () => ({ nickname: "server" }),
      matches: (observed, input: string) => observed.nickname === input,
    })
    expect(await controller.run("draft")).toEqual({
      kind: "differs",
      value: { nickname: "server" },
    })
    expect(await controller.run("server")).toEqual({
      kind: "matches",
      value: { nickname: "server" },
    })
  })

  it("古い照会を無効化し、現在値の一致を保存成功として扱わない", async () => {
    const deferredRead = deferred<string>()
    const onChange = vi.fn()
    const controller = createInspectionRecovery({
      inspect: () => deferredRead.promise,
      matches: (value: string, submitted: string) => value === submitted,
      onChange,
    })
    const read = controller.run("draft")
    controller.invalidate()
    deferredRead.resolve("draft")
    expect(await read).toEqual({ kind: "idle" })
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it("終了後に照会が完了しても状態や通知を更新しない", async () => {
    const deferredRead = deferred<string>()
    const onChange = vi.fn()
    const controller = createInspectionRecovery({
      inspect: () => deferredRead.promise,
      matches: (value: string, submitted: string) => value === submitted,
      onChange,
    })
    const read = controller.run("draft")
    controller.close()
    deferredRead.resolve("draft")
    await read
    expect(controller.getSnapshot()).toEqual({ kind: "checking" })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("照会失敗を独立した状態として表し、Actionの成立結果を変更しない", async () => {
    const controller = createInspectionRecovery({
      inspect: async (): Promise<string> => { throw Error("read failed") },
      matches: (value: string, input: string) => value === input,
    })
    expect(await controller.run("draft")).toEqual({ kind: "failed" })
  })
})
