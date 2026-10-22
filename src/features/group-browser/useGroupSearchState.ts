"use client"

import { useState } from "react"

/** Search text is a draft until the existing submit/clear interactions apply it. */
export function useGroupSearchState() {
  const [query, setQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  return { query, setQuery, appliedQuery, setAppliedQuery }
}
