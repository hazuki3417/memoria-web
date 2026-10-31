import type { Meta, StoryObj } from "@storybook/react"
import { Box, Text } from "@mantine/core"
import { SettingsLoadBoundary } from "./SettingsLoadBoundary"

const meta = {
  title: "Features/Settings/Shared Load Boundary",
  component: SettingsLoadBoundary,
  args: {
    state: "ready",
    label: "設定を読み込み中",
    children: <Text>設定コンテンツ</Text>,
  },
  decorators: [(Story) => <Box maw={760} mih={240}><Story /></Box>],
} satisfies Meta<typeof SettingsLoadBoundary>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Visual · 取得成功",
  tags: ["visual", "vrt"],
}
export const Loading: Story = {
  name: "Visual · 初期読み込み",
  tags: ["visual"],
  args: { state: "loading" },
}
export const Error: Story = {
  name: "Visual · 取得失敗（再試行なし）",
  tags: ["visual", "vrt"],
  args: { state: "error" },
}
