"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import {
  ApplicationAccountMenu,
  ApplicationContextSwitcher,
  ApplicationHeader,
  ApplicationNavigation,
  ApplicationNavigationTrigger,
  ApplicationShell,
  getApplicationNavigation,
  useApplicationNavigation,
} from "@/components/ApplicationShell"

const personalContext = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}

const communityContext = {
  id: "community",
  kind: "community" as const,
  label: "家族のアルバム",
  accentColor: "var(--mantine-color-teal-6)",
}

const applicationSections = ["dashboard", "media", "groups", "members"] as const

function getApplicationSection(pathname: string) {
  const section = pathname.split("/").filter(Boolean).at(-1)
  return applicationSections.includes(section as (typeof applicationSections)[number])
    ? (section as (typeof applicationSections)[number])
    : "dashboard"
}

export function ApplicationShellContainer({
  children,
  contextKind = "personal",
  communityId = "photo-club",
}: {
  children: ReactNode
  contextKind?: "personal" | "community"
  communityId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const navigation = useApplicationNavigation()
  const currentContext = contextKind === "community" ? communityContext : personalContext
  const activeSection = getApplicationSection(pathname)
  const navigationItems = getApplicationNavigation({
    contextKind,
    activeSection,
  })

  const getContextPath = (contextId: string) => {
    const targetIsCommunity = contextId !== "personal"
    const targetPrefix = targetIsCommunity ? `/communities/${communityId}` : ""
    const targetSupportsSection = targetIsCommunity || activeSection !== "members"
    const section = targetSupportsSection ? activeSection : "dashboard"
    return section === "dashboard" ? targetPrefix || "/dashboard" : `${targetPrefix}/${section}`
  }

  const selectNavigation = (itemId: string) => {
    const prefix = contextKind === "community" ? `/communities/${communityId}` : ""
    router.push(itemId === "dashboard" ? prefix ? `${prefix}/dashboard` : "/dashboard" : `${prefix}/${itemId}`)
    navigation.close()
  }

  return (
    <ApplicationShell
      header={
        <ApplicationHeader
          accentColor={currentContext.accentColor}
          leading={
            <ApplicationNavigationTrigger
              opened={navigation.opened}
              onToggle={navigation.toggle}
            />
          }
          context={
            <ApplicationContextSwitcher
              currentContext={currentContext}
              contexts={[personalContext, communityContext]}
              onSelect={(id) => {
                router.push(getContextPath(id))
                navigation.close()
              }}
            />
          }
          account={
            <ApplicationAccountMenu
              user={{ displayName: "ユーザー" }}
              currentContext={currentContext}
              onOpenSettings={() => router.push("/settings/profile")}
              onLogout={() => undefined}
            />
          }
        />
      }
      navigation={
        <ApplicationNavigation
          opened={navigation.opened}
          onClose={navigation.close}
          items={navigationItems}
          accentColor={currentContext.accentColor}
          onSelect={selectNavigation}
        />
      }
    >
      {children}
    </ApplicationShell>
  )
}
