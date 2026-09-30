"use client"

import {
  AppShell, Avatar, Box, Burger, Button, Divider, Group, Menu,
  NavLink, Paper, Stack, Text, Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
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
  const [opened, { toggle, close }] = useDisclosure(false)
  const [context, setContext] = useState<Context>(initialContext)
  const [section, setSection] = useState<Section>("dashboard")
  const [accountOpened, setAccountOpened] = useState(false)
  const sections: { id: Section; label: string }[] = [
    { id: "dashboard", label: "ダッシュボード" },
    { id: "media", label: "メディア" },
    { id: "groups", label: "グループ" },
    ...(context === "community" ? [{ id: "members" as const, label: "メンバー" }] : []),
  ]
  const selectContext = (next: Context) => {
    setContext(next)
    setSection("dashboard")
    close()
  }
  const selectSection = (next: Section) => {
    setSection(next)
    close()
  }

  return (
    <AppShell
      header={{ height: 40 }}
      navbar={{ width: 248, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="lg"
      styles={{ main: { minHeight: "100vh", background: "var(--mantine-color-body)" } }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="ナビゲーションを開閉" />
            <Text fw={750} size="lg">Memoria</Text>
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

      <AppShell.Navbar p="md">
        <Stack gap="md" h="100%">
          <Menu withinPortal position="bottom-start" styles={menuStyles}>
            <Menu.Target>
              <Button variant="light" color="gray" fullWidth justify="space-between" aria-label="コンテキストを切り替える">
                {context === "personal" ? "Personal" : communityName} ▾
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
          <Divider />
          <Box component="nav" aria-label="現在のコンテキスト内のナビゲーション">
            <Stack gap={4}>
              {sections.map((item) => (
                <NavLink
                  key={item.id}
                  label={item.label}
                  active={section === item.id}
                  onClick={() => selectSection(item.id)}
                  variant="light"
                  styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
                />
              ))}
            </Stack>
          </Box>
          <Box mt="auto">
            <Text c="dimmed" size="xs">レイアウト検討用プロトタイプ</Text>
          </Box>
        </Stack>
      </AppShell.Navbar>

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

