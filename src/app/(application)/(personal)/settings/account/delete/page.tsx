import { Box, ScrollArea } from "@mantine/core"
import { AccountDeletionImpact } from "@/features/account-deletion/AccountDeletionImpact"

export default function Page() {
  return (
    <ScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><Box pt="lg">
    <AccountDeletionImpact
      mockScenario={
        process.env.NODE_ENV === "production" ? undefined : "success"
      }
    />
    </Box></ScrollArea>
  )
}
