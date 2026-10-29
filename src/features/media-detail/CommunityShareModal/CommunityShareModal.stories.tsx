import type { Meta, StoryObj } from "@storybook/react"
import { CommunityShareModal } from "./CommunityShareModal"

const meta = {
  title: "Features/Media Detail/CommunityShareModal",
  component: CommunityShareModal,
  parameters: { layout: "fullscreen" },
  args: {
    detailEditor: "communities",
    setDetailEditor: () => undefined,
    detailValues: {
      tags: ["旅行"],
      groups: ["旅行"],
      communities: ["Photo Club"],
    },
    shareTarget: null,
    setShareTarget: () => undefined,
    addCommunityShare: () => undefined,
  },
} satisfies Meta<typeof CommunityShareModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual", "vrt", "vrt-modal"],
}
