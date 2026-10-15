import type { Meta, StoryObj } from "@storybook/react"
import { ZoomInput } from "./ZoomInput"

const meta = {
  title: "Features/Image Detail/Zoom Input",
  component: ZoomInput,
  args: { value: 100, onChange: () => undefined },
} satisfies Meta<typeof ZoomInput>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Enlarged: Story = { args: { value: 200 } }
