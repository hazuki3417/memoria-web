import type { Meta, StoryObj } from "@storybook/react"
import { ImageDetailCommunitySection } from "./ImageDetailCommunitySection"

const values = {
  groups: ["旅行"],
  tags: ["風景"],
  communities: ["Photo Club", "Family", "Travel", "Friends"],
}
const expanded = { groups: false, tags: false, communities: false }

const meta = {
  title: "Features/Image Detail/ImageDetailCommunitySection",
  component: ImageDetailCommunitySection,
  args: {
    context: "personal",
    detailValues: values,
    detailSectionsExpanded: expanded,
    toggleDetailSection: () => undefined,
    setUnshareTarget: () => undefined,
    setShareTarget: () => undefined,
    setDetailEditor: () => undefined,
  },
} satisfies Meta<typeof ImageDetailCommunitySection>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {}
export const Expanded: Story = { args: { detailSectionsExpanded: { ...expanded, communities: true } } }
export const Empty: Story = { args: { detailValues: { ...values, communities: [] } } }
export const Community: Story = { args: { context: "community" } }
