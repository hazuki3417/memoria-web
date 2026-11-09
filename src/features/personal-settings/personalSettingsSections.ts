import {
  IconChartBar,
  IconSettings,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react"

export type PersonalSettingsSection = "profile" | "account" | "preferences" | "usage"

export const personalSettingsSections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "account", label: "アカウント", icon: IconUserCircle },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
] satisfies { id: PersonalSettingsSection; label: string; icon: typeof IconUser }[]

