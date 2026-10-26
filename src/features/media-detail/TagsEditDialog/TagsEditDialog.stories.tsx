import type { Meta, StoryObj } from "@storybook/react"
import { TagsEditDialog } from "./TagsEditDialog"

const meta = {
  title: "Features/Media Detail/TagsEditDialog",
  component: TagsEditDialog,
  args: {
    detailEditor: "tags",
    setDetailEditor: () => undefined,
    detailDraft: ["旅行"],
    setDetailDraft: () => undefined,
    saveDetailDraft: () => undefined,
  },
} satisfies Meta<typeof TagsEditDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],
}
