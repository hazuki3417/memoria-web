"use client"

import { useState } from "react"
import { Alert, Button, Stack } from "@mantine/core"
import { useParams, useRouter } from "next/navigation"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { showNotification } from "@/components/Feedback"
import {
  CommunityDeletionConfirmation,
  useCommunityDeletionAcceptance,
  useCommunityDeletionPendingOperation,
} from "@/features/community-deletion"
import { useCommunityDeletionSnapshotQuery } from "@/infrastructure/graphql/generated"

/** Snapshot取得・Operationの持続・受付照会を接続するRoute。 */
export const CommunityDeletePageContent = () => {
  const { communityId } = useParams<{ communityId: string }>()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [checkFailed, setCheckFailed] = useState(false)
  const pending = useCommunityDeletionPendingOperation(communityId)
  const { data, loading, error, refetch } = useCommunityDeletionSnapshotQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
  })
  const { acceptDeletion, inspectAcceptance } = useCommunityDeletionAcceptance(communityId)
  const snapshot = data?.communityDeletionSnapshot

  const inspect = async () => {
    const operation = pending.operation
    if (!operation || checking) return
    setChecking(true)
    setCheckFailed(false)
    try {
      const accepted = await inspectAcceptance(operation.operationId)
      if (accepted) {
        try {
          showNotification({
            kind: "success",
            title: "Community削除の受付を確認",
            description: "削除の受付が完了しています。Mediaの物理削除は後続処理で行われます。",
          })
        } catch {
          // 通知失敗で確定した受付やDashboard遷移を妨げない。
        }
        router.push("/dashboard")
      } else {
        // 記録未検出・権限確認失敗・通信失敗から未受付を推測しない。
        setCheckFailed(true)
      }
    } catch {
      // 照会HookやNavigationの想定外例外も受付未成立の証拠にはしない。
      setCheckFailed(true)
    } finally {
      setChecking(false)
    }
  }

  const deleteSnapshot = async (revision: string) => {
    const operationId = pending.begin(revision)
    if (!operationId) return { kind: "unknown" as const }
    try {
      const result = await acceptDeletion(revision, operationId)
      if (result.kind === "unknown") pending.markUnknown(operationId)
      if (result.kind === "not-accepted" || result.kind === "review-changed") {
        pending.clearRejected(operationId)
      }
      // acceptedの記録はDashboardへの遷移まで維持し、途中離脱時にも再送できないようにする。
      return result
    } catch {
      // 想定外の例外でも、送信前に保存したOperationを消さず取得専用の復旧へ遷移する。
      pending.markUnknown(operationId)
      return { kind: "unknown" as const }
    }
  }

  if (pending.status === "loading") {
    return (
      <LoadingBoundary loading label="削除受付の操作状態を確認中">
        {null}
      </LoadingBoundary>
    )
  }

  if (pending.status === "unavailable") {
    return (
      <Alert color="red" title="削除操作の安全な状態を確認できません">
        操作状態を復元できないため、Community削除を再送できません。
        操作した覚えがある場合は、最新の受付状態を管理者に確認してください。
      </Alert>
    )
  }

  // Snapshot取得不能・Componentの再Mountでも送信Lockと操作識別子を保持する。
  if (pending.operation && pending.recovering) {
    return (
      <Stack gap="md">
        <Alert color="yellow" title="Community削除の受付結果を確認できませんでした">
          受付が成立したかどうかは未確定です。同じ削除操作を再送しないでください。
          受付時の操作記録だけを読み取り、確定した場合のみDashboardへ移動します。
        </Alert>
        {checkFailed && (
          <Alert color="yellow" title="受付結果を確定できません">
            記録が見つからない場合や通信できない場合も、削除が成立していないとは断定できません。
            削除の再送は行わず、後で受付状況を確認してください。
          </Alert>
        )}
        <Button loading={checking} disabled={checking} onClick={() => void inspect()}>
          受付状況を確認する
        </Button>
        <Button variant="default" onClick={() => router.push("/dashboard")}>
          Dashboardへ戻る
        </Button>
      </Stack>
    )
  }

  if (loading) {
    return (
      <LoadingBoundary loading label="Community削除の確認情報を読み込み中">
        {null}
      </LoadingBoundary>
    )
  }

  if (!snapshot) {
    return (
      <Stack gap="md">
        <Alert color="red" title="確認情報を取得できません">
          {error
            ? "削除対象の確認情報を取得できませんでした。"
            : "Community削除の確認情報を表示できません。"}
        </Alert>
        <Button variant="default" onClick={() => void refetch()}>
          再試行
        </Button>
      </Stack>
    )
  }

  return (
    <CommunityDeletionConfirmation
      key={snapshot.revision}
      communityId={communityId}
      communityName={snapshot.name}
      managedMediaCount={snapshot.managedMediaCount}
      isAdministrator
      onNavigate={(href) => router.push(href)}
      onDelete={() => deleteSnapshot(snapshot.revision)}
      onReviewChanged={() => void refetch()}
    />
  )
}
