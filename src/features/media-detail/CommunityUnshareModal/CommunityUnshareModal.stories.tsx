import type { Meta, StoryObj } from "@storybook/react"
import { CommunityUnshareModal } from "./CommunityUnshareModal"

const meta = {
  title: "Features/Media Detail/CommunityUnshareModal",
  component: CommunityUnshareModal,
  parameters: { layout: "fullscreen" },
  args: {
    unshareTarget: "Photo Club",
    setUnshareTarget: () => undefined,
    removeCommunityShare: () => undefined,
  },
} satisfies Meta<typeof CommunityUnshareModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual", "vrt", "vrt-modal"],
}
