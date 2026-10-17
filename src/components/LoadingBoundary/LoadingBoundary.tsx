"use client"

import { Box, Center, Loader } from "@mantine/core"
import { useEffect, useState, type ReactNode } from "react"

/**
 * Content-area loading state. Preserve the application shell outside this boundary.
 * The fallback is delayed to avoid transient loading flashes.
 */
export function LoadingBoundary({
  loading,
  children,
  delayMs = 300,
  label = "読み込み中",
}: {
  loading: boolean
  children: ReactNode
  delayMs?: number
  label?: string
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!loading) {
      setVisible(false)
      return
    }
    const timer = window.setTimeout(() => setVisible(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [loading, delayMs])

  if (!loading) return <>{children}</>
  if (!visible) return null
  return (
    <Box w="100%" aria-busy="true" role="status" aria-label={label}>
      <Center mih={180}>
        <Loader size="md" aria-hidden="true" />
      </Center>
    </Box>
  )
}
