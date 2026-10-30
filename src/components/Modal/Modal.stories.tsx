import { Button, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { ActionPanel } from "../ActionPanel"
import { Modal } from "./Modal"

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    onClose: () => undefined,
    title: "Modal title",
    children: (
      <Modal.Body>
        <Text size="sm">Modal content</Text>
      </Modal.Body>
    ),
    transitionProps: { duration: 0 },
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const WithoutDivider: Story = {
  name: "Visual · Compound without divider",
  tags: ["visual", "vrt", "vrt-modal"],
  args: {
    title: "内容の確認",
    children: (
      <>
        <Modal.Body>
          <Text size="sm">この操作を実行しますか？</Text>
        </Modal.Body>
        <Modal.Footer>
          <ActionPanel>
            <ActionPanel.End>
              <Button variant="default">キャンセル</Button>
              <Button>実行</Button>
            </ActionPanel.End>
          </ActionPanel>
        </Modal.Footer>
      </>
    ),
  },
}

export const WithDivider: Story = {
  name: "Visual · Compound with divider",
  tags: ["visual", "vrt", "vrt-modal"],
  args: {
    title: "Groupを編集",
    children: (
      <>
        <Modal.Body>
          <Text size="sm">Groupの情報を編集できます。</Text>
        </Modal.Body>
        <Modal.Divider />
        <Modal.Footer>
          <ActionPanel>
            <ActionPanel.Start>
              <Button variant="subtle" color="red">
                削除
              </Button>
            </ActionPanel.Start>
            <ActionPanel.Center>
              <Button variant="default">キャンセル</Button>
            </ActionPanel.Center>
            <ActionPanel.End>
              <Button>保存</Button>
            </ActionPanel.End>
          </ActionPanel>
        </Modal.Footer>
      </>
    ),
  },
}
