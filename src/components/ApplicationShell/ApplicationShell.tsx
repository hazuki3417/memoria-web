"use client"

import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core"
import {
  IconCheck,
  IconLogout,
  IconPlus,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import type { ComponentType, ReactNode } from "react"
import { useState } from "react"
import { NavigationItem } from "@/components/NavigationItem"

export type ApplicationContextOption = {
  id: string
  kind: "personal" | "community"
  label: string
  accentColor: string
}

export type ApplicationNavigationItem = {
  id: string
  label: string
  icon: ComponentType<{
    size?: number
    stroke?: number
    "aria-hidden"?: boolean
  }>
  active?: boolean
  disabled?: boolean
}

export type ApplicationShellProps = {
  children: ReactNode
  currentContext: ApplicationContextOption
  contexts: ApplicationContextOption[]
  navigationItems: ApplicationNavigationItem[]
  user: { displayName: string; avatarLabel?: string }
  onSelectContext: (contextId: string) => void
  onSelectNavigation: (itemId: string) => void
  onCreateCommunity?: () => void
  onOpenSettings: () => void
  onLogout: () => void
}

const menuStyles = {
  dropdown: {
    border: "1px solid var(--mantine-color-default-border)",
    borderRadius: "var(--mantine-radius-md)",
    boxShadow: "var(--mantine-shadow-md)",
    padding: 4,
    minWidth: 200,
  },
  item: {
    borderRadius: "var(--mantine-radius-sm)",
    fontSize: "var(--mantine-font-size-sm)",
    minHeight: 32,
    padding: "5px 8px",
  },
  label: { padding: "8px 8px 4px", fontSize: "var(--mantine-font-size-xs)" },
} as const

export function ApplicationShell({
  children,
  currentContext,
  contexts,
  navigationItems,
  user,
  onSelectContext,
  onSelectNavigation,
  onCreateCommunity,
  onOpenSettings,
  onLogout,
}: ApplicationShellProps) {
  const [navigationOpened, setNavigationOpened] = useState(false)

  const closeNavigation = () => setNavigationOpened(false)
  const selectContext = (id: string) => {
    onSelectContext(id)
    closeNavigation()
  }
  const selectNavigation = (id: string) => {
    onSelectNavigation(id)
    closeNavigation()
  }

  return (
    <AppShell
      header={{ height: 40 }}
      padding="lg"
      styles={{
        main: { minHeight: "100vh", background: "var(--mantine-color-body)" },
      }}
    >
      <AppShell.Header
        style={{
          zIndex: 300,
          borderTop: `2px solid ${currentContext.accentColor}`,
        }}
      >
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={navigationOpened}
              onClick={() => setNavigationOpened((opened) => !opened)}
              size="sm"
              aria-label="ナビゲーションを開閉"
              aria-controls="application-context-navigation"
              aria-expanded={navigationOpened}
            />
            <Text fw={750} size="lg">
              Memoria
            </Text>
            <Box
              w={1}
              h={20}
              bg="var(--mantine-color-default-border)"
              aria-hidden="true"
            />
            <Menu withinPortal position="bottom-start" styles={menuStyles}>
              <Menu.Target>
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  px="xs"
                  aria-label="コンテキストを切り替える"
                  maw={{ base: 144, sm: 240 }}
                >
                  <Text size="xs" mr={6} aria-hidden="true">
                    ▾
                  </Text>
                  <Text size="sm" truncate>
                    {currentContext.label}
                  </Text>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  <Group gap={6} wrap="nowrap">
                    <IconUsers size={14} stroke={1.6} aria-hidden="true" />
                    <Text size="xs">切り替え先</Text>
                  </Group>
                </Menu.Label>
                {contexts.map((context) => (
                  <Box key={context.id}>
                    <Menu.Item
                      onClick={() => selectContext(context.id)}
                      rightSection={
                        context.id === currentContext.id ? (
                          <IconCheck size={14} />
                        ) : null
                      }
                    >
                      {context.label}
                    </Menu.Item>
                  </Box>
                ))}
                {onCreateCommunity && (
                  <Menu.Item
                    leftSection={
                      <IconPlus size={16} stroke={1.6} aria-hidden="true" />
                    }
                    onClick={onCreateCommunity}
                  >
                    Communityを作成
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Menu position="bottom-end" withinPortal styles={menuStyles}>
            <Menu.Target>
              <Button
                variant="subtle"
                color="gray"
                size="compact-sm"
                px={4}
                aria-label="アカウントメニュー"
                title="アカウントメニュー"
              >
                <Avatar size={24} radius="xl">
                  {user.avatarLabel ?? user.displayName.slice(0, 1)}
                </Avatar>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Group gap="sm" px="xs" py="xs" wrap="nowrap">
                <Avatar size={32} radius="xl">
                  {user.avatarLabel ?? user.displayName.slice(0, 1)}
                </Avatar>
                <Box>
                  <Text size="sm" fw={600} lh={1.2}>
                    {user.displayName}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    {currentContext.label}
                  </Text>
                </Box>
              </Group>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconSettings size={16} stroke={1.6} />}
                onClick={onOpenSettings}
              >
                設定
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={16} stroke={1.6} />}
                onClick={onLogout}
              >
                ログアウト
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <Drawer
        opened={navigationOpened}
        onClose={closeNavigation}
        position="left"
        zIndex={200}
        size={248}
        withCloseButton={false}
        padding={0}
        closeOnClickOutside
        closeOnEscape
        overlayProps={{ backgroundOpacity: 0.35, blur: 0 }}
        styles={{
          content: {
            marginTop: 40,
            height: "calc(100dvh - 40px)",
            boxShadow: "var(--mantine-shadow-md)",
          },
          inner: { top: 0 },
          overlay: { top: 40, height: "calc(100dvh - 40px)" },
          body: { height: "100%" },
        }}
      >
        <Stack gap={0} h="100%" p="xs">
          <Box
            component="nav"
            id="application-context-navigation"
            aria-label="現在のコンテキスト内のナビゲーション"
          >
            <Stack gap={0}>
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  active={item.active}
                  disabled={item.disabled}
                  accentColor={currentContext.accentColor}
                  onClick={() => selectNavigation(item.id)}
                />
              ))}
            </Stack>
          </Box>
          <Box mt="auto">
            <Divider mb="xs" />
            <Text size="10px" c="dimmed" px="sm" pb={4}>
              © 2026 Memoria
            </Text>
          </Box>
        </Stack>
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
