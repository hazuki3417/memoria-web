import { Box, Stack, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { FeedbackAlert } from "../Feedback"
import { PageHeader } from "../PageHeader"
import { SaveStatus } from "./SaveStatus"

const meta = {
  title: "Components/Save Status",
  component: SaveStatus,
  args: { state: "saving" },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
  render: (args) => (
    <PageHeader
      title="環境設定"
      description="表示とプレビューの動作を設定します。"
      titleAccessory={<SaveStatus {...args} />}
    />
  ),
} satisfies Meta<typeof SaveStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Saving: Story = {
  name: "Visual · 保存中",
  tags: ["visual"],
}

export const Pending: Story = {
  name: "Visual · 保存待ち",
  tags: ["visual"],
  args: { state: "pending" },
}

export const Saved: Story = {
  name: "Visual · 保存済み",
  tags: ["visual"],
  args: { state: "saved" },
}

export const Attention: Story = {
  name: "Visual · 要確認",
  tags: ["visual"],
  args: { state: "attention" },
}

export const Idle: Story = {
  name: "Visual · 非表示でもレイアウト保持",
  tags: ["visual"],
  args: { state: "idle" },
}

export const WithErrorDetails: Story = {
  name: "Visual · タイトル横バッジと詳細Errorを分離",
  tags: ["visual"],
  args: { state: "attention" },
  render: (args) => (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="表示とプレビューの動作を設定します。"
        titleAccessory={<SaveStatus {...args} />}
      />
      <FeedbackAlert kind="error" title="保存結果を確認できませんでした">
        <Text size="sm">
          変更内容は保持されています。現在の設定を確認してから、必要に応じて再保存してください。
        </Text>
      </FeedbackAlert>
    </Stack>
  ),
}
