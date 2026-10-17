"use client"

import { useEffect, useState } from "react"
import { Alert, Button, Stack } from "@mantine/core"
import { useParams } from "next/navigation"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { CommunityDeletionConfirmation } from "@/features/community-settings/CommunityDeletionConfirmation"
import { getCommunityDeletionSnapshotAction } from "@/features/community-settings/actions"
import type { CommunityDeletionSnapshotRecord } from "@/infrastructure/graphql"

export default function CommunityDeletePage() {
  const { communityId } = useParams<{ communityId: string }>()
  const [snapshot, setSnapshot] = useState<CommunityDeletionSnapshotRecord | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setSnapshot(null)
    setError("")
    void getCommunityDeletionSnapshotAction(communityId)
      .then((result) => {
        if (cancelled) return
        if (result.kind === "loaded") setSnapshot(result.snapshot)
        else setError(result.kind === "not_found" || result.kind === "forbidden"
          ? "Community削除の確認情報を表示できません。"
          : "削除対象の確認情報を取得できませんでした。")
      })
      .catch(() => {
        if (!cancelled) setError("削除対象の確認情報を取得できませんでした。")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [communityId, retry])

  if (loading) return <LoadingBoundary loading label="Community削除の確認情報を読み込み中">{null}</LoadingBoundary>
  if (!snapshot) return (
    <Stack gap="md">
      <Alert color="red" title="確認情報を取得できません">{error}</Alert>
      <Button variant="default" onClick={() => setRetry((current) => current + 1)}>再試行</Button>
    </Stack>
  )
  // The deletion mutation is intentionally unavailable until the
  // transaction and durable Media cleanup pipeline are implemented.
  return (
    <CommunityDeletionConfirmation
      key={snapshot.revision}
      communityId={communityId}
      communityName={snapshot.name}
      managedMediaCount={snapshot.managedMediaCount}
      isAdministrator
    />
  )
}
