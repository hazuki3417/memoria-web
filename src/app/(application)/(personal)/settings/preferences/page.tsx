import { Box, ScrollArea } from "@mantine/core"
import { ConnectedSettings } from "@/features/settings"

export default function Page() {
  return (<ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg"><ConnectedSettings section="preferences" /></Box></ScrollArea>)
}
