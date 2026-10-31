"use client"

import { Box, Center, Loader, Stack, Text, ThemeIcon, Title } from "@mantine/core"
import { IconAlertCircle } from "@tabler/icons-react"
import { useEffect, useState, type ReactNode } from "react"

export type PageStatus = "loading" | "error" | "ready"

/**
 * A content-region status for full pages or individual page panels.
 * Surrounding navigation and application chrome stay mounted.
 */
export function PageStatusBoundary({
  state,
  label = "読み込み中",
  errorTitle = "情報を取得できませんでした",
  errorDescription = "ページを再読み込みしてください。",
  delayMs = 300,
  children,
}: {
  state: PageStatus
  label?: string
  errorTitle?: string
  errorDescription?: string
  delayMs?: number
  children: ReactNode
}) {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (state !== "loading") {
      setShowLoading(false)
      return
    }
    const timer = window.setTimeout(() => setShowLoading(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [state, delayMs])

  if (state === "ready") return <>{children}</>
  if (state === "loading" && !showLoading) return null

  return (
    <Box w="100%" mih={320} px={{ base: "md", sm: "xl" }} py="xl">
      <Center mih={272}>
        {state === "loading" ? (
          <Stack align="center" gap="sm" role="status" aria-label={label} aria-busy="true">
            <Loader size="md" color="gray" aria-hidden="true" />
            <Text size="sm" c="dimmed">{label}</Text>
          </Stack>
        ) : (
          <Stack align="center" gap="sm" maw={440} role="alert">
            <ThemeIcon
              size={56}
              radius="xl"
              variant="light"
              color="red"
              aria-hidden="true"
            >
              <IconAlertCircle size={28} stroke={1.6} />
            </ThemeIcon>
            <Title order={3} size="h4" ta="center" mt="xs">
              {errorTitle}
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              {errorDescription}
            </Text>
          </Stack>
        )}
      </Center>
    </Box>
  )
}
