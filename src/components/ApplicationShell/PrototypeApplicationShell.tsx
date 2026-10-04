"use client"

import type { ReactNode } from "react"
import { ApplicationAccountMenu } from "./ApplicationAccountMenu"
import { ApplicationContextSwitcher } from "./ApplicationContextSwitcher"
import { ApplicationHeader } from "./ApplicationHeader"
import { ApplicationNavigation, ApplicationNavigationTrigger, useApplicationNavigation } from "./ApplicationNavigation"
import { ApplicationShell } from "./ApplicationShell"
import type { ApplicationNavigationItem } from "./applicationNavigation"
import type { ApplicationContextOption } from "./types"

export function PrototypeApplicationShell({ children, currentContext, contexts, navigationItems, user = { displayName: "ユーザー" }, onSelectContext = () => undefined, onSelectNavigation = () => undefined, onCreateCommunity, onOpenSettings = () => undefined, onLogout = () => undefined }: {
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
}) {
  const navigation = useApplicationNavigation()
  const selectContext = (id: string) => { onSelectContext(id); navigation.close() }

  return <ApplicationShell
    header={<ApplicationHeader
      accentColor={currentContext.accentColor}
      leading={<ApplicationNavigationTrigger opened={navigation.opened} onToggle={navigation.toggle} />}
      context={<ApplicationContextSwitcher currentContext={currentContext} contexts={contexts} onSelect={selectContext} onCreateCommunity={onCreateCommunity} />}
      account={<ApplicationAccountMenu user={user} currentContext={currentContext} onOpenSettings={onOpenSettings} onLogout={onLogout} />}
    />}
    navigation={<ApplicationNavigation opened={navigation.opened} onClose={navigation.close} items={navigationItems} accentColor={currentContext.accentColor} onSelect={onSelectNavigation} />}
  >{children}</ApplicationShell>
}
