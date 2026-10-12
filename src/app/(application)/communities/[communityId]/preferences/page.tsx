import { CommunitySettings } from "@/features/community-settings/CommunitySettings"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  // Presentation-only until Community APIs and Membership are connected.
  return <CommunitySettings communityId={communityId} section="preferences" />
}
