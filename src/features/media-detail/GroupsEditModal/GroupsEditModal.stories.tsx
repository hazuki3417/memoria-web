import type { Meta, StoryObj } from "@storybook/react"
import { GroupsEditModal } from "./GroupsEditModal"

const meta = {
  title: "Features/Media Detail/GroupsEditModal",
  component: GroupsEditModal,
  parameters: { layout: "fullscreen" },
  args: {
    detailEditor: "groups",
    setDetailEditor: () => undefined,
    detailDraft: ["旅行"],
    setDetailDraft: () => undefined,
    saveDetailDraft: () => undefined,
  },
} satisfies Meta<typeof GroupsEditModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual", "vrt", "vrt-modal"],
}
