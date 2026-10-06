"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import {
  ApplicationAccountMenu,
  type ApplicationContextOption,
  ApplicationContextSwitcher,
  ApplicationHeader,
  ApplicationNavigation,
  type ApplicationNavigationItem,
  ApplicationNavigationTrigger,
  ApplicationShell,
  useApplicationNavigation,
} from "@/components/ApplicationShell"

export function ProductionApplicationShell({
  children,
  currentContext,
  contexts,
  navigationItems,
  user = { displayName: "ユーザー" },
  onSelectContext = () => undefined,
  onSelectNavigation = () => undefined,
  onCreateCommunity,
  onOpenSettings = () => undefined,
  onLogout = () => undefined,
  communityId = "photo-club",
}: {
  children: ReactNode
  currentContext: ApplicationContextOption
  contexts: ApplicationContextOption[]
  navigationItems: ApplicationNavigationItem[]
  user?: { displayName: string; avatarLabel?: string }
  onSelectContext?: (contextId: string) => void
  onSelectNavigation?: (itemId: string) => void
  onCreateCommunity?: () => void
  onOpenSettings?: () => void
  onLogout?: () => void
  communityId?: string
}) {
  const router = useRouter()
  const navigation = useApplicationNavigation()
  const selectContext = (id: string) => {
    onSelectContext(id)
    router.push(id === "personal" ? "/dashboard" : `/communities/${communityId}/dashboard`)
    navigation.close()
  }
  const selectNavigation = (itemId: string) => {
    onSelectNavigation(itemId)
    const prefix = currentContext.kind === "community" ? `/communities/${communityId}` : ""
    const path = itemId === "dashboard" ? prefix ? `${prefix}/dashboard` : "/dashboard" : `${prefix}/${itemId}`
    router.push(path)
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
              contexts={contexts}
              onSelect={selectContext}
              onCreateCommunity={onCreateCommunity}
            />
          }
          account={
            <ApplicationAccountMenu
              user={user}
              currentContext={currentContext}
              onOpenSettings={() => {
                onOpenSettings()
                router.push("/settings")
              }}
              onLogout={onLogout}
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
