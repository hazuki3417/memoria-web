import { GroupBrowserContainer } from "@/features/group-browser"

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>
}) {
  const { communityId } = await params
  return (
    <GroupBrowserContainer contextKind="community" communityId={communityId} />
  )
}
