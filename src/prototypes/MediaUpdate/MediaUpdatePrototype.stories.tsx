import type { Meta, StoryObj } from "@storybook/react"
import { MediaUpdatePrototype } from "./MediaUpdatePrototype"

const meta = {
  title: "Design Prototypes/Media Update",
  component: MediaUpdatePrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof MediaUpdatePrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
}

