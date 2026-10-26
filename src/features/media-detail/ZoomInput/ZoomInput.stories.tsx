import type { Meta, StoryObj } from "@storybook/react"
import { ZoomInput } from "./ZoomInput"

const meta = {
  title: "Features/Media Detail/ZoomInput",
  component: ZoomInput,
  args: { value: 100, onChange: () => undefined },
} satisfies Meta<typeof ZoomInput>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],
}
export const Enlarged: Story = {
  name: "Visual · Enlarged",
  tags: ["visual"],
  args: { value: 200 },
}
