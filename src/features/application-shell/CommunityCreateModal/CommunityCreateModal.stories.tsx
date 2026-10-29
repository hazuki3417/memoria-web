import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { CommunityCreateModal } from "./CommunityCreateModal"

const meta = {
  title: "Features/Application Shell/Community Create Dialog",
  component: CommunityCreateModal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    onClose: fn(),
    name: "",
    onNameChange: fn(),
    error: "",
    onErrorClear: fn(),
    busy: false,
    communitiesError: false,
    onCreate: fn(),
  },
} satisfies Meta<typeof CommunityCreateModal>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: "Visual · Empty",
  tags: ["visual", "vrt", "vrt-modal"],
}
export const NameEntered: Story = {
  name: "Visual · Name Entered",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { name: "家族のアルバム" },
}
export const ValidationError: Story = {
  name: "Visual · Validation Error",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { name: "家族", error: "Communityを作成できませんでした。再度お試しください。" },
}
export const CommunitiesError: Story = {
  name: "Visual · Communities Error",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { communitiesError: true },
}
export const Creating: Story = {
  name: "Visual · Creating",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { name: "家族のアルバム", busy: true },
}
