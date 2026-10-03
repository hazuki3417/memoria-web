import type { Meta, StoryObj } from "@storybook/react"
import { SectionHeader } from "./SectionHeader"

const meta = {
  title: "Components/Section Header",
  component: SectionHeader,
  args: {
    children: "基本情報",
  },
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
