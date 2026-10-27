import { ConnectedPersonalSettingsSection } from "@/features/settings/ConnectedSettings"
import { ConnectedUsage } from "@/features/usage"

export default function Page() {
  return (
    <ConnectedPersonalSettingsSection
      section="usage"
      usageContent={<ConnectedUsage scope="personal" />}
    />
  )
}
