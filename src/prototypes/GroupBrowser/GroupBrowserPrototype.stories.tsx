import type { Meta, StoryObj } from "@storybook/react"
import { GroupBrowser } from "@/features/group-browser/GroupBrowser"
import { prototypeGroups, prototypeRelationCandidateNames } from "@/features/group-browser/groupBrowserFixtures"
import { previewImages } from "@/features/group-browser/GroupPreviewGrid"

const meta = {
  title: "Design Prototypes/Group Browser",
  component: GroupBrowser,
  args: {
    groupsData: prototypeGroups,
    relationCandidates: prototypeRelationCandidateNames,
    mediaItemsData: Array.from({ length: 24 }, (_, index) => ({ id: `group-media-${index + 1}`, label: `Media ${index + 1}`, src: previewImages[index % previewImages.length] })),
  },
  parameters: { layout: "fullscreen", applicationShell: true },
} satisfies Meta<typeof GroupBrowser>

export default meta
type Story = StoryObj<typeof meta>

export const Wide: Story = {
  name: "Wide",
  tags: ["visual"],}

export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
