import { Box, NavLink, Paper, Stack, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import {
  IconLayoutDashboard,
  IconPhoto,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react"
import { ApplicationShell } from "./ApplicationShell"

const personal = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}
const family = {
  id: "family",
  kind: "community" as const,
  label: "家族のアルバム",
  accentColor: "var(--mantine-color-teal-6)",
}
const travel = {
  id: "travel",
  kind: "community" as const,
  label: "旅行の思い出",
  accentColor: "var(--mantine-color-violet-6)",
}
const contexts = [personal, family, travel]

const personalNavigation = [
  {
    id: "dashboard",
    label: "ダッシュボード",
    icon: IconLayoutDashboard,
    active: true,
  },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers },
]

const communityNavigation = [
  ...personalNavigation,
  { id: "members", label: "メンバー", icon: IconUserCircle },
]

const content = (
  <Box maw={1120} mx="auto" w="100%">
    <Paper withBorder radius="md" p="xl" mih={320}>
      <Stack align="center" justify="center" mih={260} gap="xs">
        <Text fw={600}>コンテンツ領域</Text>
        <Text c="dimmed" ta="center" size="sm">
          Screen固有のUIはApplication Shellのchildrenとして配置します。
        </Text>
      </Stack>
    </Paper>
  </Box>
)

const meta = {
  title: "Components/Application Shell",
  component: ApplicationShell,
  parameters: { layout: "fullscreen" },
  args: {
    children: content,
    currentContext: personal,
    contexts,
    navigationItems: personalNavigation,
    user: { displayName: "ユーザー" },
    onSelectContext: () => undefined,
    onSelectNavigation: () => undefined,
    onCreateCommunity: () => undefined,
    onOpenSettings: () => undefined,
    onLogout: () => undefined,
  },
} satisfies Meta<typeof ApplicationShell>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {}

export const Community: Story = {
  args: {
    currentContext: family,
    navigationItems: communityNavigation,
  },
}

export const Compact: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const WithLocalNavigation: Story = {
  args: {
    children: (
      <Box maw={1120} mx="auto" w="100%">
        <Box style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
          <Box
            component="nav"
            aria-label="設定"
            w={200}
            style={{ flexShrink: 0 }}
          >
            <Text size="xs" fw={700} c="dimmed" mb="xs">
              設定
            </Text>
            <Stack gap={0}>
              {["プロフィール", "環境設定", "利用状況", "アカウント"].map(
                (label, index) => (
                  <NavLink key={label} label={label} active={index === 0} />
                ),
              )}
            </Stack>
          </Box>
          <Paper withBorder radius="md" p="xl" style={{ flex: 1 }}>
            <Text fw={600}>Settings content</Text>
            <Text c="dimmed" size="sm" mt="xs">
              Local NavigationはScreen側が所有し、Application
              Drawerはその前面へ表示されます。
            </Text>
          </Paper>
        </Box>
      </Box>
    ),
  },
}
