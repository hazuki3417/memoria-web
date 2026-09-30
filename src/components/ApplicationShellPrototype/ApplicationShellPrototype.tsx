"use client"

import {
  AppShell, Avatar, Box, Burger, Button, Drawer, Group, Menu,
  Divider, NavLink, Paper, Stack, Text, Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconChevronLeft, IconLayoutDashboard, IconPhoto, IconUsers, IconUserCircle } from "@tabler/icons-react"
import { useState } from "react"

type Context = "personal" | "community"
type Section = "dashboard" | "media" | "groups" | "members"

const communityName = "家族のアルバム"

// GitHub風の共通メニュー試作。承認後に共通コンポーネントへ移す。
const menuStyles = {
  dropdown: { border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)", boxShadow: "var(--mantine-shadow-md)", padding: 4, minWidth: 200 },
  item: { borderRadius: "var(--mantine-radius-sm)", fontSize: "var(--mantine-font-size-sm)", minHeight: 32, padding: "6px 8px" },
  label: { padding: "8px 8px 4px", fontSize: "var(--mantine-font-size-xs)" },
} as const

/**
 * 画面レイアウトの検討専用。認証、Routing、API、既存AppShellには接続しない。
 * 具体的な色・寸法・配置はVisual Reviewで確定する。
 */
export function ApplicationShellPrototype({ initialContext = "personal" }: { initialContext?: Context }) {
  const [navigationOpened, { toggle: toggleNavigation, close: closeNavigation }] = useDisclosure(false)
  const [context, setContext] = useState<Context>(initialContext)
  const [section, setSection] = useState<Section>("dashboard")
  const [accountOpened, setAccountOpened] = useState(false)
  const sections = [
    { id: "dashboard", label: "ダッシュボード", icon: IconLayoutDashboard },
    { id: "media", label: "メディア", icon: IconPhoto },
    { id: "groups", label: "グループ", icon: IconUsers },
    ...(context === "community" ? [{ id: "members" as const, label: "メンバー", icon: IconUserCircle }] : []),
  ]
  const selectContext = (next: Context) => {
    setContext(next)
    setSection("dashboard")
    closeNavigation()
  }
  const selectSection = (next: Section) => {
    setSection(next)
    closeNavigation()
  }

  return (
    <AppShell
      header={{ height: 40 }}
      padding="lg"
      styles={{ main: { minHeight: "100vh", background: "var(--mantine-color-body)" } }}
    >
      <AppShell.Header style={{ zIndex: 300 }}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={navigationOpened} onClick={toggleNavigation} size="sm" aria-label="ナビゲーションを開閉" aria-controls="application-context-navigation" aria-expanded={navigationOpened} />
            <Text fw={750} size="lg">Memoria</Text>
            <Box w={1} h={20} bg="var(--mantine-color-default-border)" aria-hidden="true" />
            <Menu withinPortal position="bottom-start" styles={menuStyles}>
              <Menu.Target>
                <Button variant="subtle" color="gray" size="compact-sm" px="xs" aria-label="コンテキストを切り替える" maw={{ base: 144, sm: 240 }}>
                  <Text size="sm" truncate>{context === "personal" ? "Personal" : communityName}</Text>
                  <Text size="xs" ml={6} aria-hidden="true">▾</Text>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>切り替え先</Menu.Label>
                <Menu.Item onClick={() => selectContext("personal")}>Personal</Menu.Item>
                <Menu.Item onClick={() => selectContext("community")}>{communityName}</Menu.Item>
                <Menu.Divider />
                <Menu.Item disabled>Communityを作成（表示例）</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Menu opened={accountOpened} onChange={setAccountOpened} position="bottom-end" withinPortal styles={menuStyles}>
            <Menu.Target>
              <Button variant="subtle" color="gray" size="compact-sm" px={4} aria-label="アカウントメニュー" title="アカウントメニュー">
                <Avatar size={24} radius="xl">U</Avatar>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>アカウント</Menu.Label>
              <Menu.Item>プロフィール（表示例）</Menu.Item>
              <Menu.Item>ログアウト（表示例）</Menu.Item>
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
          content: { marginTop: 40, height: "calc(100dvh - 40px)", boxShadow: "var(--mantine-shadow-md)" },
          inner: { top: 0 },
          overlay: { top: 40, height: "calc(100dvh - 40px)" },
          body: { height: "100%" },
        }}
      >
        <Stack gap={0} h="100%" p="xs">
          <Box component="nav" id="application-context-navigation" aria-label="現在のコンテキスト内のナビゲーション">
            <Stack gap={2}>
              {sections.map((item) => (
                <NavLink
                  key={item.id}
                  label={item.label}
                  leftSection={<item.icon size={17} stroke={1.6} aria-hidden="true" />}
                  active={section === item.id}
                  onClick={() => selectSection(item.id)}
                  variant="subtle"
                  color="gray"
                  styles={{
                    root: {
                      borderRadius: "var(--mantine-radius-sm)",
                      borderLeft: section === item.id ? "3px solid var(--mantine-primary-color-filled)" : "3px solid transparent",
                      background: section === item.id ? "var(--mantine-color-default-hover)" : undefined,
                      padding: "7px 10px",
                      minHeight: 36,
                      fontWeight: section === item.id ? 600 : 400,
                    },
                    section: { color: "var(--mantine-color-dimmed)", marginInlineEnd: 10 },
                  }}
                />
              ))}
            </Stack>
          </Box>
          <Divider my="md" />
          <Box mt="auto">
            <Divider mb="xs" />
            <NavLink
              label="サイドバーを閉じる"
              leftSection={<IconChevronLeft size={17} stroke={1.6} aria-hidden="true" />}
              onClick={closeNavigation}
              styles={{
                root: { borderRadius: "var(--mantine-radius-sm)", padding: "7px 10px", minHeight: 36 },
                section: { color: "var(--mantine-color-dimmed)", marginInlineEnd: 10 },
              }}
            />
          </Box>
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Box maw={1120} mx="auto">
          <Stack gap="lg">
            <Box>
              <Text size="sm" c="dimmed">{context === "personal" ? "Personal" : communityName}</Text>
              <Title order={1} size="h2">{sections.find((item) => item.id === section)?.label}</Title>
            </Box>
            <Paper withBorder radius="md" p="xl" mih={320}>
              <Stack align="center" justify="center" mih={260} gap="xs">
                <Text fw={600}>コンテンツ領域</Text>
                <Text c="dimmed" ta="center" size="sm">
                  このStoryでは共通Shellのみを検討します。画面固有のデータや操作は接続していません。
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}

