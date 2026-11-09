import { CommunitySettingsRoute } from "@/features/community-settings"

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>
}) {
  const { communityId } = await params
  return <CommunitySettingsRoute communityId={communityId} section="usage" />
}
