import {
  IconLayoutDashboard,
  IconPhoto,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react"
import type {
  ApplicationContextOption,
  ApplicationNavigationItem,
} from "./types"

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

export function getApplicationSection(pathname: string): ApplicationSection {
  const section = pathname.split("/").filter(Boolean).at(-1)
  return section === "dashboard" ||
    section === "media" ||
    section === "groups" ||
    section === "members"
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
