import { describe, expect, it, vi } from "vitest"
import { createActionAdapter } from "./createActionAdapter"

describe("createActionAdapter", () => {
  it("maps an injected operation response to the supplied success evidence", async () => {
    const execute = vi.fn(async (input: number) => ({ confirmed: input + 1 }))
    const action = createActionAdapter({
      execute,
      classify: (response) => ({ kind: "success" as const, value: response.confirmed }),
    })
    expect(await action(2)).toEqual({ kind: "success", value: 3 })
    expect(execute).toHaveBeenCalledExactlyOnceWith(2)
  })

  it("never treats transport failure as a confirmed rejection by default", async () => {
    const action = createActionAdapter({
      execute: async (_: string): Promise<number> => { throw Error("timeout") },
      classify: (response) => ({ kind: "success" as const, value: response }),
    })
    expect(await action("draft")).toEqual({ kind: "unknown" })
  })

  it("allows operation-specific typed rejection evidence to be injected", async () => {
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

  it("runs post-success synchronization without making the confirmed outcome uncertain", async () => {
    const afterSuccess = vi.fn(async () => { throw Error("refetch failed") })
    const action = createActionAdapter({
      execute: async (input: string) => input,
      classify: (value) => ({ kind: "success" as const, value }),
      afterSuccess,
    })
    expect(await action("canonical")).toEqual({ kind: "success", value: "canonical" })
    expect(afterSuccess).toHaveBeenCalledExactlyOnceWith("canonical", "canonical")
  })

  it("preserves explicit evidence while handling unexpected classifier failures as unknown", async () => {
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
