import { Button, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { ActionPanel } from "../ActionPanel"
import { Dialog } from "./Dialog"

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  args: {
    opened: true,
    onClose: () => undefined,
    title: "Dialog title",
    children: <Text size="sm">Dialog content</Text>,
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Confirmation: Story = {
  name: "Visual · Confirmation",
  tags: ["visual"],
  args: {
    footer: (
      <Dialog.Footer
        secondary={<Button variant="default">キャンセル</Button>}
        primary={<Button>実行</Button>}
      />
    ),
  },
}

export const Destructive: Story = {
  name: "Visual · Destructive",
  tags: ["visual"],
  args: {
    title: "削除しますか？",
    footer: (
      <Dialog.Footer
        secondary={<Button variant="default">キャンセル</Button>}
        primary={<Button color="red">削除</Button>}
      />
    ),
  },
}

export const ThreeRegionFooter: Story = {
  name: "Visual · Three Region Footer",
  tags: ["visual"],
  args: {
    title: "編集",
    footer: (
      <Dialog.Footer
        leading={
          <Button variant="subtle" color="red">
            削除
          </Button>
        }
        secondary={<Button variant="default">キャンセル</Button>}
        primary={<Button>保存</Button>}
      />
    ),
  },
}

export const CompactThreeRegionFooter: Story = {
  name: "Visual · Compact Three Region Footer",
  tags: ["visual"],
  args: ThreeRegionFooter.args,
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompoundWithoutDivider: Story = {
  name: "Visual · Compound without divider",
  tags: ["visual", "vrt", "vrt-dialog"],
  args: {
    title: "内容の確認",
    footer: undefined,
    children: (
      <>
        <Dialog.Body>
          <Text size="sm">この操作を実行しますか？</Text>
        </Dialog.Body>
        <Dialog.Footer>
          <ActionPanel>
            <ActionPanel.End>
              <Button variant="default">キャンセル</Button>
              <Button>実行</Button>
            </ActionPanel.End>
          </ActionPanel>
        </Dialog.Footer>
      </>
    ),
    transitionProps: { duration: 0 },
  },
}

export const CompoundWithDivider: Story = {
  name: "Visual · Compound with divider",
  tags: ["visual", "vrt", "vrt-dialog"],
  args: {
    title: "Groupを編集",
    footer: undefined,
    children: (
      <>
        <Dialog.Body>
          <Text size="sm">Groupの情報を編集できます。</Text>
        </Dialog.Body>
        <Dialog.Divider />
        <Dialog.Footer>
          <ActionPanel>
            <ActionPanel.Start>
              <Button variant="subtle" color="red">削除</Button>
            </ActionPanel.Start>
            <ActionPanel.Center>
              <Button variant="default">キャンセル</Button>
            </ActionPanel.Center>
            <ActionPanel.End>
              <Button>保存</Button>
            </ActionPanel.End>
          </ActionPanel>
        </Dialog.Footer>
      </>
    ),
    transitionProps: { duration: 0 },
  },
}
