import { Button } from "@mantine/core"
import { useState } from "react"
import { SettingsUsage } from "../SettingsUsage"
import { sampleUsage } from "../../usageStoryFixtures"

export function ModeLifetimeContractStory() {
  const [scope, setScope] = useState<"personal" | "community">("personal")
  return (
    <>
      <Button
        onClick={() =>
          setScope((current) =>
            current === "personal" ? "community" : "personal",
          )
        }
      >
        Scopeを切り替え
      </Button>
      <SettingsUsage key={scope} usage={sampleUsage} scope={scope} />
    </>
  )
}
