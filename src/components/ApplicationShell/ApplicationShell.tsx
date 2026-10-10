"use client"

import { AppShell, Box } from "@mantine/core"
import type { ReactNode } from "react"

export type ApplicationShellProps = {
  children: ReactNode
  header: ReactNode
  navigation?: ReactNode
}

export function ApplicationShell({
  children,
  header,
  navigation,
}: ApplicationShellProps) {
  return (
    <AppShell
      header={{ height: 40 }}
      padding="lg"
      styles={{
        root: { height: "100dvh", overflow: "hidden" },
        main: {
          position: "fixed",
          top: 40,
          right: 0,
          bottom: 0,
          left: 0,
          height: "auto",
          paddingTop: "var(--mantine-spacing-lg)",
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          background: "var(--mantine-color-body)",
        },
      }}
    >
      {header}
      {navigation}
      <AppShell.Main><Box pt="lg">{children}</Box></AppShell.Main>
      <Box
        id="application-modal-root"
        style={{ position: "relative", zIndex: 400 }}
      />
    </AppShell>
  )
}
