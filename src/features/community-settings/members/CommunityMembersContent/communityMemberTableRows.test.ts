import { describe, expect, it } from "vitest"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import { selectCommunityMemberRows } from "./communityMemberTableRows"

const members: CommunityMember[] = [
  { id: "self", name: "ユーザー", role: "admin", isSelf: true },
  { id: "ten", name: "Member 10", role: "member" },
  { id: "two", name: "Member 2", role: "admin" },
]

describe("selectCommunityMemberRows", () => {
  it("preserves the API order when no sort is selected", () => {
    expect(selectCommunityMemberRows(members, "", null).map((member) => member.id)).toEqual([
      "self",
      "ten",
      "two",
    ])
    expect(members.map((member) => member.id)).toEqual(["self", "ten", "two"])
  })

  it("trims and case-folds the search without mutating the source", () => {
    expect(selectCommunityMemberRows(members, "  MEMBER  ", null).map((member) => member.id)).toEqual([
      "ten",
      "two",
    ])
    expect(members).toHaveLength(3)
  })

  it("sorts names numerically in both directions", () => {
    expect(
      selectCommunityMemberRows(members, "member", { key: "name", direction: "asc" })
        .map((member) => member.id),
    ).toEqual(["two", "ten"])
    expect(
      selectCommunityMemberRows(members, "member", { key: "name", direction: "desc" })
        .map((member) => member.id),
    ).toEqual(["ten", "two"])
  })

  it("sorts roles without changing the source array", () => {
    expect(
      selectCommunityMemberRows(members, "", { key: "role", direction: "asc" })
        .map((member) => member.id),
    ).toEqual(["self", "two", "ten"])
    expect(members.map((member) => member.id)).toEqual(["self", "ten", "two"])
  })
})
