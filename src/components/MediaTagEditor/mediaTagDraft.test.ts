import { describe, expect, it } from "vitest"
import { applyMediaTagDraftAction, diffMediaTagDraft } from "./mediaTagDraft"

describe("applyMediaTagDraftAction", () => {
  it("adds without duplicating existing relations", () => {
    expect(applyMediaTagDraftAction(["旅行"], " 夏 ", "add")).toEqual(["旅行", "夏"])
    expect(applyMediaTagDraftAction(["旅行"], "旅行", "add")).toEqual(["旅行"])
  })
  it("removes only the specified Tag", () => {
    expect(applyMediaTagDraftAction(["旅行", "夏"], "旅行", "remove")).toEqual(["夏"])
  })
  it("preserves the existing Upload/Update replace action", () => {
    expect(applyMediaTagDraftAction(["旅行", "夏"], "家族", "replace")).toEqual(["家族"])
  })
  it("does not change relations for empty input", () => {
    expect(applyMediaTagDraftAction(["旅行"], "   ", "replace")).toEqual(["旅行"])
  })
})

describe("diffMediaTagDraft", () => {
  it("returns only intended additions/removals and preserves unchanged relations", () => {
    expect(diffMediaTagDraft(["旅行", "夏"], ["旅行", "家族"])).toEqual({
      add: ["家族"],
      remove: ["夏"],
    })
  })
  it("returns no commands for an unchanged set regardless of order", () => {
    expect(diffMediaTagDraft(["旅行", "夏"], ["夏", "旅行"])).toEqual({ add: [], remove: [] })
  })
  it("deduplicates relation commands", () => {
    expect(diffMediaTagDraft(["旅行", "旅行"], ["夏", "夏"])).toEqual({
      add: ["夏"],
      remove: ["旅行"],
    })
  })
})
