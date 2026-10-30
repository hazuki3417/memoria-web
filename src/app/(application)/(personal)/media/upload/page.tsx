import { Box, ScrollArea } from "@mantine/core"
import { MediaUpload } from "@/features/media-upload/MediaUpload"

export default function Page() {
  return (
    <ScrollArea
      type="hover"
      h="100%"
      w="100%"
      style={{ overscrollBehavior: "contain" }}
    >
      <Box>
        <MediaUpload scenario="empty" />
      </Box>
    </ScrollArea>
  )
}
