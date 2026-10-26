import { describe, expect, it } from "vitest"
import { resolveTagFilter } from "./resolveTagFilter"

const tags = [
  { id: "TAG_A", name: "旅行" },
  { id: "TAG_B", name: "家族" },
]

describe("resolveTagFilter", () => {
  it("uses persisted Tag IDs in the selected order for AND filtering", () => {
    expect(resolveTagFilter(["家族", "旅行"], tags)).toEqual({
      ok: true, tagIds: ["TAG_B", "TAG_A"],
    })
  })

  it("does not widen the list when a name is not in the authorized scope", () => {
    expect(resolveTagFilter(["別CommunityのTag"], tags)).toEqual({
      ok: false, reason: "UNKNOWN_TAG",
    })
  })

  it("rejects duplicate selections", () => {
    expect(resolveTagFilter(["旅行", "旅行"], tags)).toEqual({
      ok: false, reason: "DUPLICATE_TAG",
    })
  })

  it("clears the filter when no Tag is selected", () => {
    expect(resolveTagFilter([], tags)).toEqual({ ok: true, tagIds: [] })
  })
})
