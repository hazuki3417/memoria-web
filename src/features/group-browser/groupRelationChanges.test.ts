import { describe, expect, it } from "vitest"
import {
  MediaGroupRelationChangeAction,
  MediaGroupRelationDirection,
} from "@/infrastructure/graphql/generated"
import { groupRelationChanges } from "./groupRelationChanges"

describe("groupRelationChanges", () => {
  const ids = new Map([
    ["親A", "parent-a"],
    ["親B", "parent-b"],
    ["子A", "child-a"],
  ])
  it("computes additions and removals by stable IDs", () => {
    expect(
      groupRelationChanges(
        { parents: ["親B"], children: ["子A"] },
        { parents: ["親A"], children: [] },
        ids,
      ),
    ).toEqual([
      {
        groupId: "parent-b",
        direction: MediaGroupRelationDirection.Parent,
        action: MediaGroupRelationChangeAction.Add,
      },
      {
        groupId: "parent-a",
        direction: MediaGroupRelationDirection.Parent,
        action: MediaGroupRelationChangeAction.Remove,
      },
      {
        groupId: "child-a",
        direction: MediaGroupRelationDirection.Child,
        action: MediaGroupRelationChangeAction.Add,
      },
    ])
  })

  it("rejects a missing candidate instead of sending a guessed ID", () => {
    expect(() =>
      groupRelationChanges(
        { parents: ["存在しない"], children: [] },
        { parents: [], children: [] },
        ids,
      ),
    ).toThrow("Relation candidate is not available")
  })
})
