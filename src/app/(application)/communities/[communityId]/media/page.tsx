import { MediaBrowserContainer } from "@/features/media-browser/MediaBrowserContainer"

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>
}) {
  const { communityId } = await params
  return <MediaBrowserContainer contextKind="community" communityId={communityId} />
}
