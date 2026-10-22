import type { Meta, StoryObj } from "@storybook/react"
import { CommunityUnshareDialog } from "./CommunityUnshareDialog"

const meta = {
  title: "Features/Media Detail/CommunityUnshareDialog",
  component: CommunityUnshareDialog,
  args: {
    unshareTarget: "Photo Club",
    setUnshareTarget: () => undefined,
    removeCommunityShare: () => undefined,
  },
} satisfies Meta<typeof CommunityUnshareDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],}
