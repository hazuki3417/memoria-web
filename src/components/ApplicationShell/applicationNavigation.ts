import {
  IconLayoutDashboard,
  IconPhoto,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react"
import type { ApplicationContextOption, ApplicationNavigationItem } from "./ApplicationShell"

export type ApplicationSection = "dashboard" | "media" | "groups" | "members"


const baseApplicationNavigation = [
  { id: "dashboard", label: "ダッシュボード", icon: IconLayoutDashboard },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers },
] satisfies ApplicationNavigationItem[]

const communityApplicationNavigation = [
  ...baseApplicationNavigation,
  { id: "members", label: "メンバー", icon: IconUserCircle },
] satisfies ApplicationNavigationItem[]

export function getApplicationNavigation({
  contextKind,
  activeSection,
}: {
  contextKind: ApplicationContextOption["kind"]
  activeSection?: ApplicationSection
}): ApplicationNavigationItem[] {
  const items =
    contextKind === "community"
      ? communityApplicationNavigation
      : baseApplicationNavigation

  return items.map((item) => ({
    ...item,
    active: item.id === activeSection,
  }))
}
