import type { Meta, StoryObj } from "@storybook/react"
import { Intersection } from "./Intersection"

const meta = {
  title: "ContentLayout/Intersection",
  component: Intersection,
} satisfies Meta<typeof Intersection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    visible: true,
  },
}
