"use client"

import { useMemo, useState } from "react"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import {
  selectCommunityMemberRows,
  type CommunityMemberSort,
  type CommunityMemberSortKey,
} from "./communityMemberTableRows"

/** Owns the search, stable default ordering and three-state column sorting. */
export function useCommunityMemberTableState(members: CommunityMember[]) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<CommunityMemberSort>(null)
  const rows = useMemo(
    () => selectCommunityMemberRows(members, query, sort),
    [members, query, sort],
  )
  const changeSort = (key: CommunityMemberSortKey) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" }
      if (current.direction === "asc") return { key, direction: "desc" }
      return null
    })
  }
  const ariaSort = (key: CommunityMemberSortKey): "ascending" | "descending" | "none" =>
    sort?.key === key
      ? sort.direction === "asc"
        ? "ascending"
        : "descending"
      : "none"

  return { query, setQuery, sort, setSort, rows, changeSort, ariaSort }
}
