import { Settings } from "@/features/settings"
import { ConnectedUsage } from "@/features/usage"

export default function Page() {
  return (
    <Settings
      section="usage"
      usageContent={<ConnectedUsage scope="personal" />}
    />
  )
}
