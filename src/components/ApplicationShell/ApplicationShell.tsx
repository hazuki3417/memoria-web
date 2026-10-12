"use client"

import { AppShell, Box } from "@mantine/core"
import { useEffect, type ReactNode } from "react"

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
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("[data-memoria-application-main]")
    if (!main) return

    const updateOffset = () => {
      const top = main.getBoundingClientRect().top
      document.documentElement.style.setProperty(
        "--memoria-notification-top",
        `${Math.max(0, top) + 12}px`,
      )
    }
    const observer = new ResizeObserver(updateOffset)
    observer.observe(main)
    window.addEventListener("resize", updateOffset)
    updateOffset()
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateOffset)
      document.documentElement.style.removeProperty("--memoria-notification-top")
    }
  }, [])

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
          paddingTop: 0,
          minHeight: 0,
          overflow: "hidden",
          overscrollBehavior: "contain",
          background: "var(--mantine-color-body)",
        },
      }}
    >
      {header}
      {navigation}
      <AppShell.Main data-memoria-application-main>
        {children}
      </AppShell.Main>
      <Box
        id="application-modal-root"
        style={{ position: "relative", zIndex: 400 }}
      />
    </AppShell>
  )
}
