import { describe, expect, it, vi } from "vitest"
import { createActionAdapter } from "./createActionAdapter"

describe("Action Adapter（createActionAdapter）", () => {
  it("注入した結果分類に従い、操作の成功結果を返す", async () => {
    const execute = vi.fn(async (input: number) => ({ confirmed: input + 1 }))
    const action = createActionAdapter({
      execute,
      classify: (response) => ({ kind: "success" as const, value: response.confirmed }),
    })
    expect(await action(2)).toEqual({ kind: "success", value: 3 })
    expect(execute).toHaveBeenCalledExactlyOnceWith(2)
  })

  it("通信処理が失敗しても、未成立が確定したものとして扱わない", async () => {
    const action = createActionAdapter({
      execute: async (_: string): Promise<number> => { throw Error("timeout") },
      classify: (response) => ({ kind: "success" as const, value: response }),
    })
    expect(await action("draft")).toEqual({ kind: "unknown" })
  })

  it("操作固有の判定を注入し、未成立が確認できた理由を返す", async () => {
    const action = createActionAdapter({
      execute: async () => ({ typename: "ValidationFailure" }),
      classify: () => ({
        kind: "rejected" as const,
        reason: { kind: "validation" as const },
      }),
    })
    expect(await action("draft")).toEqual({
      kind: "rejected",
      reason: { kind: "validation" },
    })
  })

  it("成功後の同期処理が失敗しても、確定した成功結果を維持する", async () => {
    const afterSuccess = vi.fn(async () => { throw Error("refetch failed") })
    const action = createActionAdapter({
      execute: async (input: string) => input,
      classify: (value) => ({ kind: "success" as const, value }),
      afterSuccess,
    })
    expect(await action("canonical")).toEqual({ kind: "success", value: "canonical" })
    expect(afterSuccess).toHaveBeenCalledExactlyOnceWith("canonical", "canonical")
  })

  it("明示的な拒否結果を保持し、結果分類の予期しない例外は成否不明として扱う", async () => {
    const operation = createActionAdapter({
      execute: async (): Promise<string> => { throw Error("auth") },
      classify: (value) => ({ kind: "success" as const, value }),
      classifyError: () => ({ kind: "rejected" as const, reason: "blocked" }),
    })
    expect(await operation(undefined)).toEqual({ kind: "rejected", reason: "blocked" })

    const invalidMapper = createActionAdapter({
      execute: async () => "response",
      classify: (_value: string): { kind: "success"; value: string } => {
        throw Error("mapping failed")
      },
    })
    expect(await invalidMapper(undefined)).toEqual({ kind: "unknown" })
  })
})
