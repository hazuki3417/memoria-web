"use client"

import { Box, Paper, Stack, Text } from "@mantine/core"
import { useState } from "react"
import {
  type ApplicationContextOption,
  type ApplicationSection,
  getApplicationNavigation,
  getContextSwitchSection,
} from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type Context = "personal" | "community" | "communityTravel"
type Section = ApplicationSection

const contexts: Record<Context, ApplicationContextOption> = {
  personal: {
    id: "personal",
    kind: "personal",
    label: "Personal",
    accentColor: "var(--mantine-color-blue-6)",
  },
  community: {
    id: "community",
    kind: "community",
    label: "家族のアルバム",
    accentColor: "var(--mantine-color-teal-6)",
  },
  communityTravel: {
    id: "communityTravel",
    kind: "community",
    label: "旅行の思い出",
    accentColor: "var(--mantine-color-violet-6)",
  },
}

/**
 * PrototypeApplicationShell共通ComponentのVisual Review用wrapper。
 * Routing / APIとは接続せず、Story内stateだけでinteractionを確認する。
 */
export function ApplicationShellPrototype({
  initialContext = "personal",
}: {
  initialContext?: Context
}) {
  const [contextId, setContextId] = useState<Context>(initialContext)
  const [section, setSection] = useState<Section>("dashboard")
  const currentContext = contexts[contextId]

  const navigationItems = getApplicationNavigation({
    contextKind: currentContext.kind,
    activeSection: section,
  })

  const selectContext = (id: string) => {
    const targetContext = contexts[id as Context]
    setContextId(id as Context)
    setSection((current) =>
      getContextSwitchSection(current, targetContext.kind),
    )
  }

  return (
    <PrototypeApplicationShell
      currentContext={currentContext}
      contexts={Object.values(contexts)}
      navigationItems={navigationItems}
      user={{ displayName: "ユーザー" }}
      onSelectContext={selectContext}
      onSelectNavigation={(id) => setSection(id as Section)}
      onCreateCommunity={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      <Box maw={1120} mx="auto" w="100%">
        <h1
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {navigationItems.find((item) => item.id === section)?.label}
        </h1>
        <Paper withBorder radius="md" p="xl" mih={320}>
          <Stack align="center" justify="center" mih={260} gap="xs">
            <Text fw={600}>コンテンツ領域</Text>
            <Text c="dimmed" ta="center" size="sm">
              このStoryでは共通Application
              Shellのみを検討します。画面固有のデータや操作は接続していません。
            </Text>
          </Stack>
        </Paper>
      </Box>
    </PrototypeApplicationShell>
  )
}
