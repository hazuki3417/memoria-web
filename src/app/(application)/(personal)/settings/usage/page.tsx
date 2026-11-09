import { PersonalSettingsRoute, ConnectedPersonalUsage } from "@/features/personal-settings"

export default function Page() {
  return (
    <PersonalSettingsRoute
      section="usage"
      usageContent={<ConnectedPersonalUsage />}
    />
  )
}
