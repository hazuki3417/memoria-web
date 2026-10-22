"use client"

import { useMediaQuery } from "@mantine/hooks"
import { useEffect, useRef, useState } from "react"
import type { Layout, LayoutChangedMeta } from "react-resizable-panels"
import { useGroupRef } from "react-resizable-panels"

/**
 * Owns Group selection, Compact focus recovery, and Wide split view restoration.
 * Preserve the original event order and DOM focus targets.
 */
export function useGroupNavigation(onSelectGroup?: (id: string | null) => void) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const splitViewRef = useGroupRef()
  const [savedLayout, setSavedLayout] = useState({ groups: 40, detail: 60 })
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [compactView, setCompactView] = useState<"groups" | "detail">("groups")
  const compactDetailHeadingRef = useRef<HTMLParagraphElement>(null)
  const compactSearchRef = useRef<HTMLInputElement>(null)
  const compactGroupItemRefs = useRef(new Map<string, HTMLButtonElement>())
  const compactReturnGroupIdRef = useRef<string | null>(null)
  const compactFocusIntentRef = useRef<"detail" | "groups" | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem("memoria-group-browser-layout")
    if (!stored) return
    try {
      const layout = JSON.parse(stored) as { groups?: number; detail?: number }
      if (
        typeof layout.groups === "number" &&
        typeof layout.detail === "number"
      ) {
        setSavedLayout({ groups: layout.groups, detail: layout.detail })
      }
    } catch {
      window.localStorage.removeItem("memoria-group-browser-layout")
    }
  }, [])

  // Explicit Compact navigation must not leave focus on an unmounted element.
  useEffect(() => {
    if (!compact || compactFocusIntentRef.current !== compactView) return
    compactFocusIntentRef.current = null
    if (compactView === "detail") {
      compactDetailHeadingRef.current?.focus()
    } else {
      const origin = compactReturnGroupIdRef.current
      const item = origin ? compactGroupItemRefs.current.get(origin) : null
      ;(item ?? compactSearchRef.current)?.focus()
    }
  }, [compact, compactView])

  const openDetail = (id: string) => {
    setSelectedId(id)
    onSelectGroup?.(id)
    if (compact) {
      compactReturnGroupIdRef.current = id
      compactFocusIntentRef.current = "detail"
      setCompactView("detail")
      return
    }
    const layout = splitViewRef.current?.getLayout()
    if (layout?.detail === 0) {
      splitViewRef.current?.setLayout(savedLayout)
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    onSelectGroup?.(null)
    if (compact) {
      compactFocusIntentRef.current = "groups"
      setCompactView("groups")
    }
  }

  const handleDetailExitComplete = () => {
    if (compact || selectedId) return
    splitViewRef.current?.setLayout({ groups: 100, detail: 0 })
  }

  const handleLayoutChanged = (layout: Layout, _meta: LayoutChangedMeta) => {
    if (!selectedId || layout.detail === 0) return
    const next = { groups: layout.groups, detail: layout.detail }
    setSavedLayout(next)
    window.localStorage.setItem(
      "memoria-group-browser-layout",
      JSON.stringify(next),
    )
  }


  return {
    selectedId, compact, compactView, splitViewRef, savedLayout,
    compactDetailHeadingRef, compactSearchRef, compactGroupItemRefs,
    compactReturnGroupIdRef, openDetail, closeDetail,
    handleDetailExitComplete, handleLayoutChanged,
  }
}
