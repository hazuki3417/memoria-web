import type { Meta, StoryObj } from "@storybook/react"
import { CommunityShareDialog } from "./CommunityShareDialog"

const meta = {
  title: "Features/Image Detail/Communityへ共有",
  component: CommunityShareDialog,
  args: {
    detailEditor: "communities",
    setDetailEditor: () => undefined,
    detailValues: { tags: ["旅行"], groups: ["旅行"], communities: ["Photo Club"] },
    shareTarget: null,
    setShareTarget: () => undefined,
    addCommunityShare: () => undefined,
  },
} satisfies Meta<typeof CommunityShareDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Opened: Story = {}
export const Closed: Story = {
  args: { detailEditor: null },
}
