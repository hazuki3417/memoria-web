import { Box, ScrollArea } from "@mantine/core"
import { MediaUpload } from "@/features/media-upload/MediaUpload"

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>
}) {
  const { communityId } = await params
  return (
    <ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg">
    <MediaUpload
      scenario="empty"
      context="community"
      communityId={communityId}
    />
    </Box></ScrollArea>
  )
}
