"use client"

import {
  AppShell, Avatar, Box, Burger, Button, Drawer, Group, Menu,
  Divider, NavLink, Paper, Stack, Text, useMantineColorScheme,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconCheck, IconChevronLeft, IconDeviceDesktop, IconLayoutDashboard, IconLogout, IconMoon, IconPhoto, IconPlus, IconSun, IconUser, IconUsers, IconUserCircle } from "@tabler/icons-react"
import { useState } from "react"

type Context = "personal" | "community"
type Section = "dashboard" | "media" | "groups" | "members"

const communityName = "家族のアルバム"

// Visual Review用の仮色。正式なコンテキスト設定値との接続は行わない。
const contextColors: Record<Context, string> = { personal: "var(--mantine-color-blue-6)", community: "var(--mantine-color-teal-6)" }

// GitHub風の共通メニュー試作。承認後に共通コンポーネントへ移す。
const menuStyles = {
  dropdown: { border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)", boxShadow: "var(--mantine-shadow-md)", padding: 4, minWidth: 200 },
  item: { borderRadius: "var(--mantine-radius-sm)", fontSize: "var(--mantine-font-size-sm)", minHeight: 32, padding: "5px 8px" },
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
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const accentColor = contextColors[context]
  const sections: { id: Section; label: string; icon: typeof IconLayoutDashboard }[] = [
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
      <AppShell.Header style={{ zIndex: 300, borderTop: `2px solid ${accentColor}` }}>
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
                <Menu.Label>
                  <Group gap={6} wrap="nowrap">
                    <IconUsers size={14} stroke={1.6} aria-hidden="true" />
                    <Text size="xs">切り替え先</Text>
                  </Group>
                </Menu.Label>
                <Menu.Item onClick={() => selectContext("personal")}>Personal</Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={() => selectContext("community")}>{communityName}</Menu.Item>
                <Menu.Item disabled leftSection={<IconPlus size={16} stroke={1.6} aria-hidden="true" />}>Communityを作成</Menu.Item>
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
              <Group gap="sm" px="xs" py="xs" wrap="nowrap">
                <Avatar size={32} radius="xl">U</Avatar>
                <Box>
                  <Text size="sm" fw={600} lh={1.2}>ユーザー</Text>
                  <Text size="xs" c="dimmed" lh={1.2}>{context === "personal" ? "Personal" : communityName}</Text>
                </Box>
              </Group>
              <Menu.Divider />
              <Menu.Item leftSection={<IconUser size={16} stroke={1.6} aria-hidden="true" />}>プロフィール</Menu.Item>
              <Menu.Divider />
              <Menu.Label>表示テーマ</Menu.Label>
              <Menu.Item leftSection={<IconDeviceDesktop size={16} stroke={1.6} />} rightSection={colorScheme === "auto" ? <IconCheck size={14} /> : null} onClick={() => setColorScheme("auto")}>システム</Menu.Item>
              <Menu.Item leftSection={<IconSun size={16} stroke={1.6} />} rightSection={colorScheme === "light" ? <IconCheck size={14} /> : null} onClick={() => setColorScheme("light")}>ライト</Menu.Item>
              <Menu.Item leftSection={<IconMoon size={16} stroke={1.6} />} rightSection={colorScheme === "dark" ? <IconCheck size={14} /> : null} onClick={() => setColorScheme("dark")}>ダーク</Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconLogout size={16} stroke={1.6} aria-hidden="true" />}>ログアウト</Menu.Item>
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
            <Stack gap={0}>
              {sections.map((item) => (
                <Box key={item.id} pos="relative" pl={8}>
                  {section === item.id && (
                    <Box
                      pos="absolute"
                      top={3}
                      bottom={3}
                      left={0}
                      w={3}
                      bg={accentColor}
                      style={{ borderRadius: "var(--mantine-radius-xl)", pointerEvents: "none" }}
                      aria-hidden="true"
                    />
                  )}
                  <NavLink
                    label={item.label}
                    leftSection={<item.icon size={16} stroke={1.6} aria-hidden="true" />}
                    active={section === item.id}
                    onClick={() => selectSection(item.id)}
                    variant="subtle"
                    color="gray"
                    styles={{
                      root: {
                        borderRadius: "var(--mantine-radius-sm)",
                        background: section === item.id ? "var(--mantine-color-default-hover)" : undefined,
                        padding: "5px 8px",
                        minHeight: 32,
                        fontWeight: section === item.id ? 600 : 400,
                      },
                      section: { color: "var(--mantine-color-dimmed)", marginInlineEnd: 8 },
                      label: { fontSize: "var(--mantine-font-size-sm)", lineHeight: 1.3 },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
          <Divider my="md" />
          <Box mt="auto">
            <Divider mb="xs" />
            <NavLink
              label="サイドバーを閉じる"
              leftSection={<IconChevronLeft size={14} stroke={1.6} aria-hidden="true" />}
              onClick={closeNavigation}
              styles={{
                root: { borderRadius: "var(--mantine-radius-sm)", padding: "4px 8px", minHeight: 28 },
                section: { color: "var(--mantine-color-dimmed)", marginInlineEnd: 6 },
                label: { color: "var(--mantine-color-dimmed)", fontSize: "var(--mantine-font-size-xs)", lineHeight: 1.3 },
              }}
            />
            <Text size="xs" c="dimmed" px="sm" pt="sm" pb={4}>© 2026 Memoria</Text>
          </Box>
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Box maw={1120} mx="auto" w="100%">
          <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>
            {sections.find((item) => item.id === section)?.label}
          </h1>
          <Paper withBorder radius="md" p="xl" mih={320}>
            <Stack align="center" justify="center" mih={260} gap="xs">
              <Text fw={600}>コンテンツ領域</Text>
              <Text c="dimmed" ta="center" size="sm">
                このStoryでは共通Shellのみを検討します。画面固有のデータや操作は接続していません。
              </Text>
            </Stack>
          </Paper>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}

