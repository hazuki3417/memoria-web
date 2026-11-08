"use client"

import { useMemo, useState } from "react"
import type { CommunityMember } from "@/features/community/CommunityProvider"

type SortKey = "name" | "role"
type MemberSort = { key: SortKey; direction: "asc" | "desc" } | null

/** Owns the search, stable default ordering and three-state column sorting. */
export function useCommunityMemberTableState(members: CommunityMember[]) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<MemberSort>(null)
  const rows = useMemo(
    () =>
      members
        .filter((member) =>
          member.name
            .toLocaleLowerCase("ja-JP")
            .includes(query.trim().toLocaleLowerCase("ja-JP")),
        )
        .sort((a, b) => {
          if (!sort) return 0 // Preserve the API's self-first, then name order.
          const left = sort.key === "name" ? a.name : a.role
          const right = sort.key === "name" ? b.name : b.role
          const result = left.localeCompare(right, "ja-JP", { numeric: true })
          return sort.direction === "asc" ? result : -result
        }),
    [members, query, sort],
  )
  const changeSort = (key: SortKey) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" }
      if (current.direction === "asc") return { key, direction: "desc" }
      return null
    })
  }
  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sort?.key === key
      ? sort.direction === "asc"
        ? "ascending"
        : "descending"
      : "none"

  return { query, setQuery, sort, setSort, rows, changeSort, ariaSort }
}
