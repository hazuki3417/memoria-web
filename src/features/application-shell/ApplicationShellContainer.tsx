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
  const navigationItems = getApplicationNavigation({
    contextKind,
    activeSection: "dashboard",
  })

  return (
    <ApplicationShell
      header={
        <ApplicationHeader
          accentColor={personalContext.accentColor}
          leading={
            <ApplicationNavigationTrigger
              opened={navigation.opened}
              onToggle={navigation.toggle}
            />
          }
          context={
            <ApplicationContextSwitcher
              currentContext={contextKind === "community" ? communityContext : personalContext}
              contexts={[personalContext]}
              onSelect={(itemId) => {
                const prefix = contextKind === "community" ? `/communities/${communityId}` : ""
                router.push(itemId === "dashboard" ? prefix || "/" : `${prefix}/${itemId}`)
              }}
            />
          }
          account={
            <ApplicationAccountMenu
              user={{ displayName: "ユーザー" }}
              currentContext={personalContext}
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
          accentColor={personalContext.accentColor}
          onSelect={() => undefined}
        />
      }
    >
      {children}
    </ApplicationShell>
  )
}
