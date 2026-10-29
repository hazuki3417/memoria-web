import type { Meta, StoryObj } from "@storybook/react"
import { TagsEditModal } from "./TagsEditModal"

const meta = {
  title: "Features/Media Detail/TagsEditModal",
  component: TagsEditModal,
  parameters: { layout: "fullscreen" },
  args: {
    detailEditor: "tags",
    setDetailEditor: () => undefined,
    detailDraft: ["旅行"],
    setDetailDraft: () => undefined,
    saveDetailDraft: () => undefined,
  },
} satisfies Meta<typeof TagsEditModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual", "vrt", "vrt-modal"],
}
