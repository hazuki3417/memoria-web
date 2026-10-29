import { Button } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { ActionPanel } from "./ActionPanel"

const meta = {
  title: "Components/ActionPanel",
  component: ActionPanel,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ActionPanel>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeRegions: Story = {
  tags: ["visual", "vrt"],
  render: () => (
    <ActionPanel>
      <ActionPanel.Start><Button color="red" variant="subtle">削除</Button></ActionPanel.Start>
      <ActionPanel.Center><Button variant="default">キャンセル</Button></ActionPanel.Center>
      <ActionPanel.End><Button>保存</Button></ActionPanel.End>
    </ActionPanel>
  ),
}

export const StartAndEnd: Story = {
  tags: ["visual", "vrt"],
  render: () => (
    <ActionPanel>
      <ActionPanel.Start><Button variant="default">戻る</Button></ActionPanel.Start>
      <ActionPanel.End><Button>次へ</Button></ActionPanel.End>
    </ActionPanel>
  ),
}

export const CenterOnly: Story = {
  tags: ["visual", "vrt"],
  render: () => (
    <ActionPanel>
      <ActionPanel.Center><Button>閉じる</Button></ActionPanel.Center>
    </ActionPanel>
  ),
}

export const EndWithTwoButtons: Story = {
  tags: ["visual", "vrt"],
  render: () => (
    <ActionPanel>
      <ActionPanel.End>
        <Button variant="default">キャンセル</Button>
        <Button>実行</Button>
      </ActionPanel.End>
    </ActionPanel>
  ),
}

export const StartOnly: Story = {
  tags: ["visual", "vrt"],
  render: () => (
    <ActionPanel>
      <ActionPanel.Start>
        <Button variant="default">戻る</Button>
      </ActionPanel.Start>
    </ActionPanel>
  ),
}

export const StartWithTwoButtons: Story = {
  tags: ["visual", "vrt"],
  render: () => (
    <ActionPanel>
      <ActionPanel.Start>
        <Button variant="default">キャンセル</Button>
        <Button>続ける</Button>
      </ActionPanel.Start>
    </ActionPanel>
  ),
}
