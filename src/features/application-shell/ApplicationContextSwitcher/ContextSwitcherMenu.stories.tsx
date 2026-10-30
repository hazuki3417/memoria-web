import { Box, Button } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { ContextSwitcherMenu } from "./ContextSwitcherMenu"

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
const meta = {
  title: "Features/Application Shell/Context Switcher/Menu",
  component: ContextSwitcherMenu,
  args: {
    opened: true,
    onOpenedChange: fn(),
    trigger: (
      <Box p="sm">
        <Button variant="subtle" color="gray" size="compact-sm">
          Personal
        </Button>
      </Box>
    ),
    currentContext: personal,
    contexts: [personal, family, travel],
    search: "",
    onSearchChange: fn(),
    onSelect: fn(),
    onCreateCommunity: fn(),
    onRetry: fn(),
    loading: false,
    error: false,
  },
} satisfies Meta<typeof ContextSwitcherMenu>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  name: "Visual · Context一覧",
  tags: ["visual", "vrt", "vrt-menu"],
}
export const Community: Story = {
  name: "Visual · Community選択中",
  tags: ["visual", "vrt", "vrt-menu"],
  args: { currentContext: family },
}
export const Empty: Story = {
  name: "Visual · Communityなし",
  tags: ["visual", "vrt", "vrt-menu"],
  args: { contexts: [personal] },
}
export const Loading: Story = {
  name: "Visual · 初期取得中",
  tags: ["visual", "vrt", "vrt-menu"],
  args: { contexts: [personal], loading: true },
}
export const Error: Story = {
  name: "Visual · 取得失敗",
  tags: ["visual", "vrt", "vrt-menu"],
  args: { error: true },
}
