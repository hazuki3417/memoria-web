import type { CommunityMember } from "@/features/community/CommunityProvider"

export type CommunityMemberSortKey = "name" | "role"
export type CommunityMemberSort = {
  key: CommunityMemberSortKey
  direction: "asc" | "desc"
} | null

/** Filters members while preserving API order unless a column sort is selected. */
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
      if (!sort) return 0 // Preserve the API's self-first, then name order.
      const left = sort.key === "name" ? a.name : a.role
      const right = sort.key === "name" ? b.name : b.role
      const result = left.localeCompare(right, "ja-JP", { numeric: true })
      return sort.direction === "asc" ? result : -result
    })
}
