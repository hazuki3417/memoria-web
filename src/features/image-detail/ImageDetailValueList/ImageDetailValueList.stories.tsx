import type { Meta, StoryObj } from "@storybook/react"
import { ImageDetailValueList } from "./ImageDetailValueList"

const values = ["旅行", "風景", "海", "山", "お気に入り", "2026年", "記録"]

const meta = {
  title: "Features/Image Detail/ImageDetailValueList",
  component: ImageDetailValueList,
  args: {
    values,
    variant: "outline",
    expanded: false,
    onToggle: () => undefined,
  },
} satisfies Meta<typeof ImageDetailValueList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const TagsStyle: Story = { args: { variant: "light" } }
export const Expanded: Story = { args: { expanded: true } }
export const Empty: Story = { args: { values: [] } }
export const SixItems: Story = { args: { values: values.slice(0, 6) } }
