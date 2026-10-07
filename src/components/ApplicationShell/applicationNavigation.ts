import {
  IconLayoutDashboard,
  IconPhoto,
  IconUsers,
} from "@tabler/icons-react"
import type {
  ApplicationContextOption,
  ApplicationNavigationItem,
} from "./types"

export type ApplicationSection = "dashboard" | "media" | "groups"

const baseApplicationNavigation = [
  { id: "dashboard", label: "ダッシュボード", icon: IconLayoutDashboard },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers },
] satisfies ApplicationNavigationItem[]

const communityApplicationNavigation = [...baseApplicationNavigation] satisfies ApplicationNavigationItem[]

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
