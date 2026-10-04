import {
  IconLayoutDashboard,
  IconPhoto,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react"
import type {
  ApplicationContextOption,
  ApplicationNavigationItem,
} from "@/components/ApplicationShell"

export type ApplicationSection = "dashboard" | "media" | "groups" | "members"

export const prototypeApplicationContexts = {
  personal: {
    id: "personal",
    kind: "personal",
    label: "Personal",
    accentColor: "var(--mantine-color-blue-6)",
  },
  community: {
    id: "community",
    kind: "community",
    label: "家族のアルバム",
    accentColor: "var(--mantine-color-teal-6)",
  },
  communityTravel: {
    id: "communityTravel",
    kind: "community",
    label: "旅行の思い出",
    accentColor: "var(--mantine-color-violet-6)",
  },
} satisfies Record<string, ApplicationContextOption>

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
