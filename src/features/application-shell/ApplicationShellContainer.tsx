"use client"

import { useRouter } from "next/navigation"
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
  const navigation = useApplicationNavigation()
  const currentContext = contextKind === "community" ? communityContext : personalContext
  const navigationItems = getApplicationNavigation({
    contextKind,
    activeSection: "dashboard",
  })

  const selectNavigation = (itemId: string) => {
    const prefix = contextKind === "community" ? `/communities/${communityId}` : ""
    router.push(itemId === "dashboard" ? prefix || "/" : `${prefix}/${itemId}`)
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
                router.push(id === "personal" ? "/" : `/communities/${communityId}`)
                navigation.close()
              }}
            />
          }
          account={
            <ApplicationAccountMenu
              user={{ displayName: "ユーザー" }}
              currentContext={currentContext}
              onOpenSettings={() => router.push("/settings")}
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
