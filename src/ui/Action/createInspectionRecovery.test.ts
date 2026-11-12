import { describe, expect, it, vi } from "vitest"
import { createInspectionRecovery } from "./createInspectionRecovery"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe("createInspectionRecovery", () => {
  it("compares authoritative observations using an injected policy", async () => {
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

  it("invalidates a stale observation without reporting it as a confirmed write", async () => {
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

  it("cannot update a closed process when a pending read completes", async () => {
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

  it("represents read errors without rewriting Action outcomes", async () => {
    const controller = createInspectionRecovery({
      inspect: async (): Promise<string> => { throw Error("read failed") },
      matches: (value: string, input: string) => value === input,
    })
    expect(await controller.run("draft")).toEqual({ kind: "failed" })
  })
})
