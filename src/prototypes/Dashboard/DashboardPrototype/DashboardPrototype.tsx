"use client"

import { media } from "./dashboardPrototypeData"
import { RecentGroups } from "./RecentGroups"
import { RecentMediaCarousel } from "./RecentMediaCarousel"

import {
  Box as ScrollPaddingBox,
  ScrollArea as PageScrollArea,
} from "@mantine/core"

import { GroupItem } from "@/components/GroupItem"

import {
  Box,
  Button,
  Center,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import {
  IconFolder,
  IconPhoto,
} from "@tabler/icons-react"
import { useState } from "react"
import { getApplicationNavigation } from "@/features/application-shell"
import { PageWidth } from "@/components/PageWidth/PageWidth"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type ContextKind = "personal" | "community"
type DashboardState = "default" | "empty"

const contexts = [
  {
    id: "personal",
    kind: "personal" as const,
    label: "Personal",
    accentColor: "var(--mantine-color-blue-6)",
  },
  {
    id: "community",
    kind: "community" as const,
    label: "家族のアルバム",
    accentColor: "var(--mantine-color-teal-6)",
  },
]

export function DashboardPrototype({
  initialContext = "personal",
  initialState = "default",
  communityId,
}: {
  initialContext?: ContextKind
  initialState?: DashboardState
  communityId?: string
}) {
  const [contextKind, setContextKind] = useState<ContextKind>(initialContext)
  const currentContext =
    contexts.find((context) => context.kind === contextKind) ?? contexts[0]
  const collectionHref = (section: "media" | "groups") =>
    contextKind === "personal"
      ? `/${section}`
      : communityId
        ? `/communities/${encodeURIComponent(communityId)}/${section}`
        : undefined

  const navigationItems = getApplicationNavigation({
    contextKind,
    activeSection: "dashboard",
  })

  return (
    <PrototypeApplicationShell
      currentContext={currentContext}
      contexts={contexts}
      navigationItems={navigationItems}
      user={{ displayName: "Hazuki" }}
      onSelectContext={(id) =>
        setContextKind(id === "community" ? "community" : "personal")
      }
      onSelectNavigation={() => undefined}
      onCreateCommunity={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      <PageScrollArea
        type="hover"
        h="100%"
        w="100%"
        style={{ overscrollBehavior: "contain" }}
      >
        <ScrollPaddingBox pt="lg">
          <PageWidth variant="contained">
            <Stack gap="xl" w="100%">
              <Stack gap="sm">
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Title order={3} size="h4">
                    最近のメディア
                  </Title>
                  {initialState === "default" && (
                    <Button
                      component="a"
                      href={collectionHref("media")}
                      disabled={!collectionHref("media")}
                      variant="subtle"
                      size="compact-sm"
                    >
                      すべて見る
                    </Button>
                  )}
                </Group>
                {initialState === "default" ? (
                  <RecentMediaCarousel />
                ) : (
                  <Center
                    mih={132}
                    px="md"
                    style={{
                      border: "1px solid var(--mantine-color-default-border)",
                      borderRadius: "var(--mantine-radius-md)",
                    }}
                  >
                    <Stack align="center" gap={8}>
                      <Group gap={6}>
                        <IconPhoto
                          size={20}
                          stroke={1.5}
                          color="var(--mantine-color-dimmed)"
                          aria-hidden="true"
                        />
                        <Text size="sm" c="dimmed" fw={500}>
                          メディアはまだありません
                        </Text>
                      </Group>
                      <Button
                        component="a"
                        href={collectionHref("media")}
                        disabled={!collectionHref("media")}
                        variant="subtle"
                        size="compact-sm"
                      >
                        メディアへ移動
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Stack>
              <Stack gap="sm">
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Title order={3} size="h4">
                    最近のGroup
                  </Title>
                  {initialState === "default" && (
                    <Button
                      component="a"
                      href={collectionHref("groups")}
                      disabled={!collectionHref("groups")}
                      variant="subtle"
                      size="compact-sm"
                    >
                      すべて見る
                    </Button>
                  )}
                </Group>
                {initialState === "default" ? (
                  <RecentGroups />
                ) : (
                  <Center
                    mih={132}
                    px="md"
                    style={{
                      border: "1px solid var(--mantine-color-default-border)",
                      borderRadius: "var(--mantine-radius-md)",
                    }}
                  >
                    <Stack align="center" gap={8}>
                      <Group gap={6}>
                        <IconFolder
                          size={20}
                          stroke={1.5}
                          color="var(--mantine-color-dimmed)"
                          aria-hidden="true"
                        />
                        <Text size="sm" c="dimmed" fw={500}>
                          Groupはまだありません
                        </Text>
                      </Group>
                      <Button
                        component="a"
                        href={collectionHref("groups")}
                        disabled={!collectionHref("groups")}
                        variant="subtle"
                        size="compact-sm"
                      >
                        Groupへ移動
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Stack>
            </Stack>
          </PageWidth>
        </ScrollPaddingBox>
      </PageScrollArea>
    </PrototypeApplicationShell>
  )
}
