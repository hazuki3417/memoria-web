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
          height: "calc(100dvh - 40px)",
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          background: "var(--mantine-color-body)",
        },
      }}
    >
      {header}
      {navigation}
      <AppShell.Main>{children}</AppShell.Main>
      <Box
        id="application-modal-root"
        style={{ position: "relative", zIndex: 400 }}
      />
    </AppShell>
  )
}
