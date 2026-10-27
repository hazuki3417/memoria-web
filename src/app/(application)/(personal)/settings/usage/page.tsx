import { Box, ScrollArea } from "@mantine/core"
import { Settings } from "@/features/settings"
import { ConnectedUsage } from "@/features/usage"

export default function Page() {
  return (
    <ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg">
    <Settings
      section="usage"
      usageContent={<ConnectedUsage scope="personal" />}
    />
    </Box></ScrollArea>
  )
}
