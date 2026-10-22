import type { Meta, StoryObj } from "@storybook/react"
import { MediaDetailGroupsSection } from "./MediaDetailGroupsSection"

const values = {
  groups: ["旅行", "お気に入り", "家族", "2026年", "北海道", "思い出", "風景"],
  tags: ["自然", "海", "山", "旅行", "風景", "写真", "記録"],
  communities: ["Photo Club"],
}
const expanded = { groups: false, tags: false, communities: false }

const meta = {
  title: "Features/Media Detail/MediaDetailGroupsSection",
  component: MediaDetailGroupsSection,
  args: {
    detailValues: values,
    detailSectionsExpanded: expanded,
    toggleDetailSection: () => undefined,
    openDetailEditor: () => undefined,
  },
} satisfies Meta<typeof MediaDetailGroupsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],}
export const Expanded: Story = {
  name: "Visual · Expanded",
  tags: ["visual"],
  args: { detailSectionsExpanded: { ...expanded, groups: true } },
}
export const Empty: Story = {
  name: "Visual · Empty",
  tags: ["visual"],
  args: { detailValues: { ...values, groups: [] } },
}
export const SixItems: Story = {
  name: "Visual · Six Items",
  tags: ["visual"],
  args: { detailValues: { ...values, groups: values.groups.slice(0, 6) } },
}
