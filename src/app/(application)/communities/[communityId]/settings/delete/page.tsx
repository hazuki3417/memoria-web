"use client"

import { Alert, Box, Button, ScrollArea, Stack } from "@mantine/core"
import { useParams } from "next/navigation"
import { LoadingBoundary } from "@/components/LoadingBoundary/LoadingBoundary"
import { CommunityDeletionConfirmation } from "@/features/community-settings/CommunityDeletionConfirmation"
import {
  MyCommunitiesDocument,
  useAcceptCommunityDeletionMutation,
  useCommunityDeletionSnapshotQuery,
} from "@/infrastructure/graphql/generated"

function CommunityDeletePageContent() {
  const { communityId } = useParams<{ communityId: string }>()
  const { data, loading, error, refetch } = useCommunityDeletionSnapshotQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
  })
  const [acceptDeletion] = useAcceptCommunityDeletionMutation()
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
      onDelete={async () => {
        try {
          const result = await acceptDeletion({
            variables: { input: { communityId, revision: snapshot.revision } },
            refetchQueries: [MyCommunitiesDocument],
            awaitRefetchQueries: true,
          })
          if (!result.data?.acceptCommunityDeletion.accepted)
            throw new Error("ACCEPTANCE_UNCONFIRMED")
        } catch (caught) {
          const graphError = caught as {
            graphQLErrors?: Array<{ extensions?: { code?: string } }>
          }
          if (
            graphError.graphQLErrors?.some(
              (item) => item.extensions?.code === "CONFLICT",
            )
          )
            throw new Error("REVIEW_CHANGED")
          throw caught
        }
      }}
      onReviewChanged={() => void refetch()}
    />
  )
}

export default function CommunityDeletePage() {
  return (
    <ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}>
      <Box pt="lg"><CommunityDeletePageContent /></Box>
    </ScrollArea>
  )
}
