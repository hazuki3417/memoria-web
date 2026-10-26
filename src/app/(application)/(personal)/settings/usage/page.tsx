import { ConnectedUsage, Settings } from "@/features/settings"

export default function Page() {
  return <Settings section="usage" usageContent={<ConnectedUsage scope="personal" />} />
}
