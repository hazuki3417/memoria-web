"use client"

import { useMantineTheme } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useEffect, useState } from "react"

export type ViewportCategory = "compact" | "medium" | "wide"

export type ResponsiveViewport = {
  category: ViewportCategory | null
  isResolved: boolean
}

/**
 * Viewport categories support design and testing; they do not mandate
 * where individual components must switch layouts.
 *
 * sm/xl is the current candidate mapping (see memoria-web #58).
 * Consumers must handle the unresolved state during SSR and hydration.
 */
export function useResponsiveViewport(): ResponsiveViewport {
  const { breakpoints } = useMantineTheme()
  const isAtLeastSm = useMediaQuery(`(min-width: ${breakpoints.sm})`)
  const isAtLeastXl = useMediaQuery(`(min-width: ${breakpoints.xl})`)
  const [isResolved, setIsResolved] = useState(false)

  useEffect(() => {
    setIsResolved(true)
  }, [])

  if (!isResolved) {
    return { category: null, isResolved: false }
  }

  const category: ViewportCategory = isAtLeastXl
    ? "wide"
    : isAtLeastSm
      ? "medium"
      : "compact"

  return { category, isResolved: true }
}
