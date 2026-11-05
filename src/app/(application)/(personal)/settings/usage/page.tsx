import { ConnectedPersonalSettingsSection } from "@/features/settings"
import { ConnectedPersonalUsage } from "@/features/settings"

export default function Page() {
  return (
    <ConnectedPersonalSettingsSection
      section="usage"
      usageContent={<ConnectedPersonalUsage />}
    />
  )
}
