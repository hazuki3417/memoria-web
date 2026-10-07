import { MediaUpload } from "@/features/media-upload/MediaUpload"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  return <MediaUpload context="community" communityId={communityId} />
}
