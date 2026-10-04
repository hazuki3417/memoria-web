"use client"

import { AppShell, Box } from "@mantine/core"
import type { ReactNode } from "react"

export type ApplicationShellProps = {
  children: ReactNode
  header: ReactNode
  navigation?: ReactNode
}

export function ApplicationShell({ children, header, navigation }: ApplicationShellProps) {
  return (
    <AppShell
      header={{ height: 40 }}
      padding="lg"
      styles={{ main: { minHeight: "100vh", background: "var(--mantine-color-body)" } }}
    >
      {header}
      {navigation}
      <AppShell.Main>{children}</AppShell.Main>
      <Box id="application-modal-root" style={{ position: "relative", zIndex: 400 }} />
    </AppShell>
  )
}
