import { Group, SegmentedControl, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { PageHeader } from "./PageHeader"
import { SaveStatus } from "../SaveStatus"

const meta = {
  title: "Components/Page Header",
  component: PageHeader,
  args: {
    title: "プロフィール",
    description: "プロフィール情報を変更します。",
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],
}

export const WithTitleAccessoryStatus: Story = {
  name: "Visual · タイトル横の保存バッジ",
  tags: ["visual"],
  args: {
    title: "環境設定",
    description: "表示とプレビューの動作を設定します。",
    titleAccessory: <SaveStatus state="saving" />,
  },
}

export const WithIdleTitleAccessoryStatus: Story = {
  name: "Visual · 状態非表示時も配置を予約",
  tags: ["visual"],
  args: {
    title: "環境設定",
    description: "表示とプレビューの動作を設定します。",
    titleAccessory: <SaveStatus state="idle" />,
  },
}

export const WithExternalUsageAction: Story = {
  name: "Visual · タイトルBadgeと右側のUsage操作が共存",
  tags: ["visual"],
  args: {
    title: "利用状況",
    description: "Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。",
    titleAccessory: <SaveStatus state="saving" />,
  },
  render: (args) => (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
      <PageHeader {...args} />
      <Group gap="xs" wrap="nowrap">
        <Text size="sm" c="dimmed" id="usage-header-mode-label">
          表示
        </Text>
        <SegmentedControl
          size="xs"
          aria-labelledby="usage-header-mode-label"
          defaultValue="size"
          data={[
            { value: "size", label: "容量" },
            { value: "percent", label: "割合" },
          ]}
        />
      </Group>
    </Group>
  ),
}
