import { Box, ScrollArea } from "@mantine/core"
import { PageWidth } from "@/components/PageWidth/PageWidth"
import { DashboardContainer } from "@/features/dashboard/DashboardContainer"

export default function Page() {
  return (
    <ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg">
    <PageWidth variant="contained">
      <DashboardContainer />
    </PageWidth>
    </Box></ScrollArea>
  )
}
