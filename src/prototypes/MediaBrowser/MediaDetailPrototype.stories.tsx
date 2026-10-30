import type { Meta, StoryObj } from "@storybook/react"
import { MediaBrowserPrototype } from "./MediaBrowserPrototype"

const meta = {
  title: "Design Prototypes/MediaBrowserPrototype/MediaDetail",
  component: MediaBrowserPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaBrowserPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="縦長 Media 1を開く"]',
    )
    button?.click()
  },
}
