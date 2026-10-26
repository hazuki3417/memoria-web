import { MediaUpdateLive } from "@/features/media-update/MediaUpdate"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ communityId: string }>
  searchParams: Promise<{ mediaIds?: string }>
}) {
  const { communityId } = await params
  const { mediaIds } = await searchParams
  const ids = [...new Set((mediaIds ?? "").split(",").filter(Boolean))]
  return (
    <MediaUpdateLive
      context="community"
      communityId={communityId}
      targets={ids.map((id, index) => ({
        id,
        label: `Media ${index + 1}`,
        detail: "",
      }))}
    />
  )
}
