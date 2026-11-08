import { ConnectedPersonalSettingsSection } from "@/features/personal-settings"
import { ConnectedPersonalUsage } from "@/features/personal-settings"

export default function Page() {
  return (
    <ConnectedPersonalSettingsSection
      section="usage"
      usageContent={<ConnectedPersonalUsage />}
    />
  )
}
