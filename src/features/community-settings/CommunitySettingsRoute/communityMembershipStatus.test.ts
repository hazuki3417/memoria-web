import { describe, expect, it } from "vitest"
import { getCommunityMembershipStatus } from "./communityMembershipStatus"

describe("getCommunityMembershipStatus", () => {
  it.each([
    [{ loading: true, failed: false, hasData: false, isMember: false }, "loading"],
    [{ loading: false, failed: true, hasData: false, isMember: false }, "error"],
    [{ loading: false, failed: false, hasData: false, isMember: false }, "error"],
    [{ loading: false, failed: true, hasData: true, isMember: false }, "error"],
    [{ loading: false, failed: false, hasData: true, isMember: false }, "not-member"],
    [{ loading: false, failed: false, hasData: true, isMember: true }, "ready"],
  ] as const)("classifies membership lookup %#", (input, expected) => {
    expect(getCommunityMembershipStatus(input)).toBe(expected)
  })
})
