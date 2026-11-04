import {
  IconAdjustments,
  IconChartBar,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
export type CommunitySettingsSection =
  | "general"
  | "members"
  | "usage"
  | "preferences"

/**
 * Defines Community-specific routes and menu metadata.
 * Rendering and selection remain in the shared SettingsSectionNavigation.
 */
export function getCommunitySettingsSections(communityId: string) {
  const prefix = `/communities/${encodeURIComponent(communityId)}`
  return [
    {
      id: "general",
      label: "一般",
      icon: IconAdjustments,
      href: `${prefix}/settings`,
    },
    {
      id: "members",
      label: "メンバー",
      icon: IconUsers,
      href: `${prefix}/members`,
    },
    {
      id: "preferences",
      label: "環境設定",
      icon: IconSettings,
      href: `${prefix}/preferences`,
    },
    {
      id: "usage",
      label: "利用状況",
      icon: IconChartBar,
      href: `${prefix}/usage`,
    },
  ] satisfies {
    id: CommunitySettingsSection
    label: string
    icon: typeof IconSettings
    href: string
  }[]
}
