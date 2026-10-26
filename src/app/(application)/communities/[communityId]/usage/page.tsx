import { CommunitySettingsRoute } from "@/features/community-settings/CommunitySettingsRoute"
import { ConnectedUsage } from "@/features/usage"

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>
}) {
  const { communityId } = await params
  // Presentation-only until Community APIs and Membership are connected.
  return (
    <CommunitySettingsRoute
      communityId={communityId}
      section="usage"
      usageContent={<ConnectedUsage scope="community" communityId={communityId} />}
    />
  )
}
