import { Box, ScrollArea } from "@mantine/core"
import { MediaUpdateLive } from "@/features/media-update/MediaUpdate"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mediaIds?: string }>
}) {
  const { mediaIds } = await searchParams
  const ids = [...new Set((mediaIds ?? "").split(",").filter(Boolean))]
  return (
    <ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box>
    <MediaUpdateLive
      context="personal"
      targets={ids.map((id, index) => ({
        id,
        label: `Media ${index + 1}`,
        detail: "",
      }))}
    />
    </Box></ScrollArea>
  )
}
