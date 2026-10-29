import { Button, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { Dialog } from "./Dialog"

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: { layout: "fullscreen" },
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
