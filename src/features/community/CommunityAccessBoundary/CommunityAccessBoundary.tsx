"use client"

import { Button, Center } from "@mantine/core"
import type { ReactNode } from "react"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useCommunityDetailsQuery } from "@/infrastructure/graphql/generated"
import { CommunityAccessUnavailable } from "./CommunityAccessUnavailable"
import { getCommunityAccessStatus } from "./communityAccessStatus"

/**
 * Guards Community page content. Application Shell and its Media Detail
 * controller are outside this boundary and are tracked separately in #263.
 */
export function CommunityAccessBoundary({
  communityId,
  children,
  onReturnToDashboard,
  onLogin,
}: {
  communityId: string
  children: ReactNode
  onReturnToDashboard: () => void
  onLogin: () => void
}) {
  const { data, loading, error, refetch } = useCommunityDetailsQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const status = getCommunityAccessStatus({
    communityId,
    result: data,
    loading,
    error,
  })

  if (status === "ready") return <>{children}</>

  if (status === "unavailable")
    return (
      <CommunityAccessUnavailable
        onReturnToDashboard={onReturnToDashboard}
      />
    )

  const failed = status === "error" || status === "unauthenticated"
  return (
    <>
      <PageStatusBoundary
        state={failed ? "error" : "loading"}
        label="Communityへのアクセスを確認中"
        errorTitle={
          status === "unauthenticated"
            ? "認証状態を確認できませんでした"
            : "Communityを取得できませんでした"
        }
        errorDescription={
          status === "unauthenticated"
            ? "再度ログインしてからアクセスしてください。"
            : "通信状況を確認して再試行してください。"
        }
      >
        {null}
      </PageStatusBoundary>
      {failed && (
        <Center>
          {status === "unauthenticated" ? (
            <Button variant="light" onClick={onLogin}>
              ログインへ
            </Button>
          ) : (
            <Button variant="light" onClick={() => void refetch().catch(() => undefined)}>
              再試行
            </Button>
          )}
        </Center>
      )}
    </>
  )
}
