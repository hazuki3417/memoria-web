import { Box, ScrollArea } from "@mantine/core"
import { Settings } from "@/features/settings"

export default function Page() {
  return (<ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg"><Settings section="account" /></Box></ScrollArea>)
}
