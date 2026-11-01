"use client"

import { Box, ScrollArea } from "@mantine/core"
import { CommunityDeletePageContent } from "./CommunityDeletePageContent"

export default function CommunityDeletePage() {
  return (
    <ScrollArea
      type="hover"
      h="100%"
      w="100%"
      style={{ overscrollBehavior: "contain" }}
    >
      <Box pt="lg">
        <CommunityDeletePageContent />
      </Box>
    </ScrollArea>
  )
}
