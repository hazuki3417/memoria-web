import { GroupBrowser } from "@/features/group-browser/GroupBrowser"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  return <GroupBrowser contextKind="community" communityId={communityId} />
}
