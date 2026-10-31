"use client"

import { Alert, Box, Center } from "@mantine/core"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import type { ReactNode } from "react"

export type SettingsLoadState = "loading" | "error" | "ready"

export function SettingsLoadBoundary({
  state,
  label,
  children,
}: {
  state: SettingsLoadState
  label: string
  children: ReactNode
}) {
  if (state === "loading") {
    return (
      <LoadingBoundary loading label={label}>
        {null}
      </LoadingBoundary>
    )
  }
  if (state === "error") {
    return (
      <Box>
        <Center mih={180}>
          <Alert color="red" title="設定を取得できませんでした" role="alert">
            ページを再読み込みしてください。
          </Alert>
        </Center>
      </Box>
    )
  }
  return <>{children}</>
}
