import { describe, expect, it } from "vitest"
import { getApplicationNavigation } from "./applicationNavigation"

describe("getApplicationNavigation", () => {
  it("returns the standard personal navigation", () => {
    const items = getApplicationNavigation({
      contextKind: "personal",
      activeSection: "media",
    })

    expect(items.map(({ id, label, active }) => ({ id, label, active }))).toEqual([
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

    expect(items.map(({ id, label, active }) => ({ id, label, active }))).toEqual([
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
