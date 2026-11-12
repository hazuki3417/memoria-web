import { describe, expect, it, vi } from "vitest"
import { SettingsGraphQLExecutionError, SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { profileSaveAction } from "./profileSaveAction"

describe("profileSaveAction", () => {
  it("returns confirmed success without inventing a payload", async () => {
    const save = vi.fn(async (_nickname: string) => undefined)
    expect(await profileSaveAction(save)("new nickname")).toEqual({
      kind: "success",
      value: undefined,
    })
    expect(save).toHaveBeenCalledExactlyOnceWith("new nickname")
  })

  it("preserves typed field validation for the form", async () => {
    const violation = {
      scope: "FIELD",
      code: "TOO_LONG",
      inputPaths: [{ segments: ["nickname"] }],
    }
    const save = vi.fn(async () => {
      throw new SettingsInputValidationError([violation])
    })
    expect(await profileSaveAction(save)("too long")).toEqual({
      kind: "rejected",
      reason: { kind: "validation", violations: [violation] },
    })
  })

  it("preserves explicit blocked feedback details", async () => {
    const error = { kind: "blocked", message: "not allowed" }
    const save = vi.fn(async () => { throw error })
    expect(await profileSaveAction(save)("nickname")).toEqual({
      kind: "rejected",
      reason: { kind: "blocked", error },
    })
  })

  it("keeps explicitly retryable feedback separate from transport uncertainty", async () => {
    const save = vi.fn(async () => { throw { kind: "retryable" } })
    expect(await profileSaveAction(save)("nickname")).toEqual({
      kind: "rejected",
      reason: { kind: "retryable" },
    })
  })

  it("does not treat a missing response or timeout as confirmed rejection", async () => {
    const save = vi.fn(async () => { throw new Error("network timeout") })
    expect(await profileSaveAction(save)("nickname")).toEqual({ kind: "unknown" })
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("keeps missing typed results unknown even with GraphQL validation errors", async () => {
    const save = vi.fn(async () => {
      throw new SettingsGraphQLExecutionError([
        { extensions: { code: "VALIDATION" } },
      ])
    })
    expect(await profileSaveAction(save)("nickname")).toEqual({ kind: "unknown" })
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("does not retry automatically when the outcome is unknown", async () => {
    const save = vi.fn(async () => { throw { graphQLErrors: [{ extensions: { code: "INTERNAL" } }] } })
    expect(await profileSaveAction(save)("nickname")).toEqual({ kind: "unknown" })
    expect(save).toHaveBeenCalledTimes(1)
  })
})
