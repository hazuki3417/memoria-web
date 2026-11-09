"use client"

import { Button, Center } from "@mantine/core"
import type { ReactNode } from "react"
import { PageStatusBoundary, type PageStatus } from "../PageStatusBoundary/PageStatusBoundary"

/** SettingsのSectionに共通する取得状態表示。Retry処理自体は接続元が所有する。 */
export function SettingsContentStatus({
  state,
  label,
  errorTitle,
  onRetry,
  children,
}: {
  state: PageStatus
  label: string
  errorTitle?: string
  onRetry?: () => void
  children: ReactNode
}) {
  if (state === "ready") return <>{children}</>

  return (
    <>
      <PageStatusBoundary
        state={state}
        label={label}
        errorTitle={errorTitle}
      >
        {null}
      </PageStatusBoundary>
      {state === "error" && onRetry && (
        <Center>
          <Button variant="light" onClick={onRetry}>
            再試行
          </Button>
        </Center>
      )}
    </>
  )
}
