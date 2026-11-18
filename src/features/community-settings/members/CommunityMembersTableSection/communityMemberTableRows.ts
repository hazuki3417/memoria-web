import type { CommunityMember } from "@/features/community/CommunityProvider"

export type CommunityMemberSortKey = "name" | "role"
export type CommunityMemberSort = {
  key: CommunityMemberSortKey
  direction: "asc" | "desc"
}

/** Local name search and single-column sorting, initially by Japanese name order. */
export function selectCommunityMemberRows(
  members: CommunityMember[],
  query: string,
  sort: CommunityMemberSort,
): CommunityMember[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja-JP")
  return members
    .filter((member) =>
      member.name.toLocaleLowerCase("ja-JP").includes(normalizedQuery),
    )
    .sort((a, b) => {
      const left = sort.key === "name" ? a.name : a.role
      const right = sort.key === "name" ? b.name : b.role
      const result = left.localeCompare(right, "ja-JP", { numeric: true })
      return sort.direction === "asc" ? result : -result
    })
}
