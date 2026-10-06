import { MediaBrowser } from "@/features/media-browser/MediaBrowser"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  return <MediaBrowser contextKind="community" communityId={communityId} />
}
