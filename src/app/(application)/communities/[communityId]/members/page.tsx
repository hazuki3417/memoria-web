import { CommunitySettingsRoute } from "@/features/community-settings/CommunitySettingsRoute"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  // Presentation-only until Community APIs and Membership are connected.
  return <CommunitySettingsRoute communityId={communityId} section="members" />
}
