"use client"

import { Alert, Button, Stack } from "@mantine/core"
import { useParams } from "next/navigation"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { CommunityDeletionConfirmation } from "@/features/community-settings"
import { useCommunityDeletionAcceptance } from "@/features/community-deletion"
import { useCommunityDeletionSnapshotQuery } from "@/infrastructure/graphql/generated"

export function CommunityDeletePageContent() {
  const { communityId } = useParams<{ communityId: string }>()
  const { data, loading, error, refetch } = useCommunityDeletionSnapshotQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
  })
  const { acceptDeletion } = useCommunityDeletionAcceptance(communityId)
  const snapshot = data?.communityDeletionSnapshot

  if (loading)
    return (
      <LoadingBoundary loading label="Community削除の確認情報を読み込み中">
        {null}
      </LoadingBoundary>
    )
  if (!snapshot)
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
  return (
    <CommunityDeletionConfirmation
      key={snapshot.revision}
      communityId={communityId}
      communityName={snapshot.name}
      managedMediaCount={snapshot.managedMediaCount}
      isAdministrator
      onDelete={() => acceptDeletion(snapshot.revision)}
      onReviewChanged={() => void refetch()}
    />
  )
}
