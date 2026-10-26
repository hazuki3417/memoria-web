import type { Meta, StoryObj } from "@storybook/react"
import { MediaDetailCommunitySection } from "./MediaDetailCommunitySection"

const values = {
  groups: ["旅行"],
  tags: ["風景"],
  communities: ["Photo Club", "Family", "Travel", "Friends"],
}
const expanded = { groups: false, tags: false, communities: false }

const meta = {
  title: "Features/Media Detail/MediaDetailCommunitySection",
  component: MediaDetailCommunitySection,
  args: {
    context: "personal",
    detailValues: values,
    detailSectionsExpanded: expanded,
    toggleDetailSection: () => undefined,
    setUnshareTarget: () => undefined,
    setShareTarget: () => undefined,
    setDetailEditor: () => undefined,
  },
} satisfies Meta<typeof MediaDetailCommunitySection>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {
  name: "Visual · Personal",
  tags: ["visual"],
}
export const Expanded: Story = {
  name: "Visual · Expanded",
  tags: ["visual"],
  args: { detailSectionsExpanded: { ...expanded, communities: true } },
}
export const Empty: Story = {
  name: "Visual · Empty",
  tags: ["visual"],
  args: { detailValues: { ...values, communities: [] } },
}
export const Community: Story = {
  name: "Visual · Community",
  tags: ["visual"],
  args: { context: "community" },
}
