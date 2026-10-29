"use client"


import { useState, type ReactNode } from "react"
import {
  getApplicationNavigation,
  getContextSwitchSection,
  type ApplicationContextOption,
  type ApplicationSection,
} from "../src/features/application-shell"
import { PrototypeApplicationShell } from "../src/prototypes/PrototypeApplicationShell"

// Storybook共通のApplicationShell fixture。個別StoryはShellの構成を所有しない。
const contexts: ApplicationContextOption[] = [
  { id: "personal", kind: "personal", label: "Personal", accentColor: "var(--mantine-color-blue-6)" },
  { id: "community", kind: "community", label: "Photo Club", accentColor: "var(--mantine-color-violet-6)" },
]

export function StorybookApplicationShell({ children }: { children: ReactNode }) {
  const [contextId, setContextId] = useState("personal")
  const [section, setSection] = useState<ApplicationSection>("dashboard")
  const currentContext = contexts.find((context) => context.id === contextId) ?? contexts[0]

  return (
    <PrototypeApplicationShell
      currentContext={currentContext}
      contexts={contexts}
      navigationItems={getApplicationNavigation({ contextKind: currentContext.kind, activeSection: section })}
      user={{ displayName: "ユーザー" }}
      onSelectContext={(id) => {
        const target = contexts.find((context) => context.id === id)
        if (!target) return
        setSection((current) => getContextSwitchSection(current, target.kind))
        setContextId(id)
      }}
      onSelectNavigation={(id) => setSection(id as ApplicationSection)}
    >
      <>
      {children}
          </>
</PrototypeApplicationShell>
  )
}
