import type { Meta, StoryObj } from "@storybook/react"
import { CommunityUnshareDialog } from "./CommunityUnshareDialog"

const meta = {
  title: "Features/Image Detail/Community共有解除",
  component: CommunityUnshareDialog,
  args: {
    unshareTarget: "Photo Club",
    setUnshareTarget: () => undefined,
    removeCommunityShare: () => undefined,
  },
} satisfies Meta<typeof CommunityUnshareDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Opened: Story = {}
export const Closed: Story = {
  args: { unshareTarget: null },
}
