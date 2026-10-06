import { MediaUpdate } from "@/features/media-update/MediaUpdate"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  return <MediaUpdate context="community" communityId={communityId} />
}
