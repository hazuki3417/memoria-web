import { describe, expect, it, vi } from "vitest"
import {
  getSaveActionFailure,
  requireConfirmedSave,
  resolveSaveAction,
  SaveActionError,
} from "./saveAction"

describe("保存方式に依存しないActionの結果", () => {
  it("保存した値をconfirmedとして返し、Triggerの種類に依存しない", async () => {
    const persist = vi.fn().mockResolvedValue("confirmed-value")
    const result = await resolveSaveAction(persist, () => ({ status: "unknown" }))
    expect(result).toEqual({ status: "confirmed", value: "confirmed-value" })
    expect(requireConfirmedSave(result)).toBe("confirmed-value")
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it("Actionが分類した拒否をQueueとの境界で保持する", async () => {
    const result = await resolveSaveAction(
      async () => { throw { kind: "retryable" } },
      () => ({ status: "retryable" }),
    )
    expect(result).toEqual({ status: "retryable" })
    expect(() => requireConfirmedSave(result)).toThrow(SaveActionError)
    try {
      requireConfirmedSave(result)
    } catch (error) {
      expect(getSaveActionFailure(error)).toEqual({ status: "retryable" })
    }
  })

  it("未分類の例外を安全側のUnknownとし、勝手に再試行可能とみなさない", () => {
    expect(getSaveActionFailure(new Error("connection lost"))).toEqual({ status: "unknown" })
    expect(getSaveActionFailure({ kind: "retryable" })).toEqual({ status: "unknown" })
    expect(getSaveActionFailure({ graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] })).toEqual({
      status: "unknown",
    })
  })
})
