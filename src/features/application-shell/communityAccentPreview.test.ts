import { describe, expect, it } from "vitest"
import {
  releaseCommunityAccentPreview,
  resolveCommunityAccent,
} from "./communityAccentPreview"

describe("Community accent presentation", () => {
  const preview = { communityId: "community-a", color: "#ABCDEF", owner: 7 }

  it("shows preview for the current Community without changing confirmed color", () => {
    const confirmed = "#112233"
    expect(resolveCommunityAccent("community-a", confirmed, preview)).toBe(
      "#ABCDEF",
    )
    expect(confirmed).toBe("#112233")
  })

  it("does not apply a Community preview to other Community contexts", () => {
    expect(resolveCommunityAccent("community-b", "#445566", preview)).toBe(
      "#445566",
    )
    expect(resolveCommunityAccent(null, "#778899", preview)).toBe("#778899")
  })

  it("removes only the owning preview", () => {
    expect(releaseCommunityAccentPreview(preview, "community-a", 7)).toBeNull()
    expect(releaseCommunityAccentPreview(preview, "community-a", 6)).toEqual(
      preview,
    )
    expect(releaseCommunityAccentPreview(preview, "community-b", 7)).toEqual(
      preview,
    )
  })

  it("protects a newer preview against stale save completion", () => {
    const latest = { communityId: "community-a", color: "#FEDCBA", owner: 8 }
    expect(releaseCommunityAccentPreview(latest, "community-a", 7)).toEqual(
      latest,
    )
  })
})
