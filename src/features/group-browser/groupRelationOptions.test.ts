import { describe, expect, it } from "vitest"
import {
  groupRelationOptionReason,
  groupRelationOptions,
  sortGroupRelationNames,
} from "./groupRelationOptions"

describe("Group relation selector rules (GB-048, GB-050)", () => {
  it("sorts selected names without mutating the draft (GB-050)", () => {
    const draft = ["桜", "あお", "Z"]
    const snapshot = [...draft]
    expect(sortGroupRelationNames(draft)).toEqual([...draft].sort())
    expect(draft).toEqual(snapshot)
  })

  it("disables the Group itself and the opposite-direction selection (GB-048)", () => {
    const options = groupRelationOptions({
      candidates: ["現在", "親", "子", "候補"],
      names: ["親"],
      oppositeNames: ["子"],
      currentGroupName: "現在",
      direction: "parent",
    })
    expect(options.map((option) => [option.value, option.disabled])).toEqual([
      ["現在", true],
      ["親", false],
      ["子", true],
      ["候補", false],
    ])
    expect(
      groupRelationOptionReason({
        name: "子",
        checked: false,
        oppositeNames: ["子"],
        currentGroupName: "現在",
        direction: "parent",
      }),
    ).toBe("Childに指定されています")
    expect(
      groupRelationOptionReason({
        name: "親",
        checked: false,
        oppositeNames: ["親"],
        currentGroupName: "現在",
        direction: "child",
      }),
    ).toBe("Parentに指定されています")
  })

  it("keeps a previously selected relation removable even if adding it is now forbidden", () => {
    const availability = {
      "既存": {
        parent: { canAdd: false, reason: "上限" },
        child: { canAdd: true },
      },
      "新規": {
        parent: { canAdd: false, reason: "循環します" },
        child: { canAdd: true },
      },
    }
    const options = groupRelationOptions({
      candidates: ["既存", "新規"],
      names: ["既存"],
      oppositeNames: [],
      currentGroupName: "現在",
      direction: "parent",
      availability,
    })
    expect(options[0].disabled).toBe(false)
    expect(options[1].disabled).toBe(true)
    expect(
      groupRelationOptionReason({
        name: "新規",
        checked: false,
        oppositeNames: [],
        currentGroupName: "現在",
        direction: "parent",
        availability,
      }),
    ).toBe("循環します")
  })

  it("prioritizes self, opposite direction, and selected reasons", () => {
    const base = {
      oppositeNames: ["反対"],
      currentGroupName: "現在",
      direction: "child" as const,
    }
    expect(groupRelationOptionReason({ ...base, name: "現在", checked: true }))
      .toBe("現在のGroup")
    expect(groupRelationOptionReason({ ...base, name: "反対", checked: true }))
      .toBe("Parentに指定されています")
    expect(groupRelationOptionReason({ ...base, name: "選択", checked: true }))
      .toBe("選択済み")
  })
})
