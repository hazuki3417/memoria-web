import type { Meta, StoryObj } from "@storybook/react"
import { ImageDetailClassificationSection } from "./ImageDetailClassificationSection"

const values = {
  groups: ["旅行", "お気に入り", "家族", "2026年", "北海道", "思い出", "風景"],
  tags: ["自然", "海", "山", "旅行", "風景", "写真", "記録"],
  communities: ["Photo Club"],
}
const expanded = { groups: false, tags: false, communities: false }

const meta = {
  title: "Features/Image Detail/ImageDetailClassificationSection",
  component: ImageDetailClassificationSection,
  args: {
    kind: "groups",
    detailValues: values,
    detailSectionsExpanded: expanded,
    toggleDetailSection: () => undefined,
    openDetailEditor: () => undefined,
  },
} satisfies Meta<typeof ImageDetailClassificationSection>

export default meta
type Story = StoryObj<typeof meta>

export const Groups: Story = {}
export const Tags: Story = { args: { kind: "tags" } }
export const Expanded: Story = { args: { detailSectionsExpanded: { ...expanded, groups: true } } }
export const Empty: Story = { args: { detailValues: { ...values, groups: [] } } }
