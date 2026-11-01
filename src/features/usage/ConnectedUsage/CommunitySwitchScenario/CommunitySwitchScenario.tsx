import { Button } from "@mantine/core"
import { useState } from "react"
import { ConnectedUsage } from "../ConnectedUsage"

export function CommunitySwitchScenario() {
  const [communityId, setCommunityId] = useState("club-a")
  return (
    <>
      <Button onClick={() => setCommunityId("club-b")}>
        Community Bへ切り替え
      </Button>
      <ConnectedUsage scope="community" communityId={communityId} />
    </>
  )
}
