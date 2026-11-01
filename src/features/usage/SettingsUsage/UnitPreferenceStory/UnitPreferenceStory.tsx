import { Button, Group } from "@mantine/core"
import { useState } from "react"
import { SettingsUsage } from "../SettingsUsage"
import { sampleUsage } from "../../usageStoryFixtures"

export function UnitPreferenceStory() {
  const [unit, setUnit] = useState<"DECIMAL" | "BINARY">("DECIMAL")

  return (
    <>
      <Group mb="md">
        <Button onClick={() => setUnit("BINARY")}>Binaryに変更</Button>
        <Button onClick={() => setUnit("DECIMAL")}>Decimalに戻す</Button>
      </Group>
      <SettingsUsage usage={sampleUsage} fileSizeUnit={unit} />
    </>
  )
}
