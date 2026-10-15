import type { Meta, StoryObj } from "@storybook/react"
import { GroupsEditDialog } from "./GroupsEditDialog"

const meta = {
  title: "Features/Image Detail/Groups編集",
  component: GroupsEditDialog,
  args: {
    detailEditor: "groups",
    setDetailEditor: () => undefined,
    detailDraft: ["旅行"],
    setDetailDraft: () => undefined,
    saveDetailDraft: () => undefined,
  },
} satisfies Meta<typeof GroupsEditDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Opened: Story = {}
export const Closed: Story = {
  args: { detailEditor: null },
}
