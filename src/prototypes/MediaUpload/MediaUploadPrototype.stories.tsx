import type { Meta, StoryObj } from "@storybook/react"
import { MediaUploadPrototype } from "./MediaUploadPrototype"

const meta = {
  title: "Design Prototypes/Media Upload",
  component: MediaUploadPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaUploadPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { scenario: "empty", context: "personal" },
}

