import {
  IconLayoutDashboard,
  IconPhoto,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react"
import type {
  ApplicationContextOption,
  ApplicationNavigationItem,
} from "./types"

export type ApplicationSection = "dashboard" | "media" | "groups" | "members" | "settings"

const baseApplicationNavigation = [
  { id: "dashboard", label: "ダッシュボード", icon: IconLayoutDashboard },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers },
] satisfies ApplicationNavigationItem[]

const communityApplicationNavigation = [
  ...baseApplicationNavigation,
  { id: "settings", label: "設定", icon: IconSettings },
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

export function getApplicationSection(pathname: string): ApplicationSection {
  const parts = pathname.split("/").filter(Boolean)
  const section = parts.at(-1)
  if (parts[0] === "communities" && ["members", "usage", "preferences", "settings"].includes(parts[2])) return "settings"
  return section === "dashboard" ||
    section === "media" ||
    section === "groups" ||
    section === "members" ||
    section === "settings"
    ? section
    : "dashboard"
}

export function getContextSwitchSection(
  currentSection: ApplicationSection,
  targetContextKind: ApplicationContextOption["kind"],
): ApplicationSection {
  const targetItems = getApplicationNavigation({ contextKind: targetContextKind })
  return targetItems.some(
    (item) => item.id === currentSection && !item.disabled,
  )
    ? currentSection
    : "dashboard"
}

export function getContextSwitchPath({
  currentPathname,
  targetContextKind,
  communityId,
}: {
  currentPathname: string
  targetContextKind: ApplicationContextOption["kind"]
  communityId: string
}): string {
  const currentSection = getApplicationSection(currentPathname)
  const section = getContextSwitchSection(currentSection, targetContextKind)
  const prefix =
    targetContextKind === "community" ? `/communities/${communityId}` : ""
  return section === "dashboard"
    ? prefix
      ? `${prefix}/dashboard`
      : "/dashboard"
    : `${prefix}/${section}`
}
