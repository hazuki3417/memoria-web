import { Box, ScrollArea } from "@mantine/core"
import { CommunitySettingsRoute } from "@/features/community-settings/CommunitySettingsRoute"

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>
}) {
  const { communityId } = await params
  // Presentation-only until the Community API and current Membership are connected.
  return (<ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg"><CommunitySettingsRoute communityId={communityId} /></Box></ScrollArea>)
}
