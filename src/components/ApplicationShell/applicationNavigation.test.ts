import { describe, expect, it } from "vitest"
import {
  getApplicationNavigation,
  getContextSwitchPath,
} from "./applicationNavigation"

describe("getApplicationNavigation", () => {
  it("returns the standard personal navigation", () => {
    const items = getApplicationNavigation({
      contextKind: "personal",
      activeSection: "media",
    })

    expect(
      items.map(({ id, label, active }) => ({ id, label, active })),
    ).toEqual([
      { id: "dashboard", label: "ダッシュボード", active: false },
      { id: "media", label: "メディア", active: true },
      { id: "groups", label: "グループ", active: false },
    ])
  })

  it("adds members navigation for community context", () => {
    const items = getApplicationNavigation({
      contextKind: "community",
      activeSection: "members",
    })

    expect(
      items.map(({ id, label, active }) => ({ id, label, active })),
    ).toEqual([
      { id: "dashboard", label: "ダッシュボード", active: false },
      { id: "media", label: "メディア", active: false },
      { id: "groups", label: "グループ", active: false },
      { id: "members", label: "メンバー", active: true },
    ])
  })

  it("does not mutate active state between calls", () => {
    const first = getApplicationNavigation({
      contextKind: "personal",
      activeSection: "media",
    })
    const second = getApplicationNavigation({
      contextKind: "personal",
      activeSection: "groups",
    })

    expect(first.find((item) => item.id === "media")?.active).toBe(true)
    expect(second.find((item) => item.id === "media")?.active).toBe(false)
  })
})

describe("getContextSwitchPath", () => {
  it("preserves the media destination when switching from Personal to Community", () => {
    expect(
      getContextSwitchPath({
        currentPathname: "/media",
        targetContextKind: "community",
        communityId: "family-123",
      }),
    ).toBe("/communities/family-123/media")
  })

  it("preserves Groups when switching from Community to Personal", () => {
    expect(
      getContextSwitchPath({
        currentPathname: "/communities/family-123/groups",
        targetContextKind: "personal",
        communityId: "family-123",
      }),
    ).toBe("/groups")
  })

  it("falls back to the selected context Dashboard when the section is unavailable", () => {
    expect(
      getContextSwitchPath({
        currentPathname: "/communities/family-123/members",
        targetContextKind: "personal",
        communityId: "family-123",
      }),
    ).toBe("/dashboard")
  })
})
