import type { Meta, StoryObj } from "@storybook/react"
import { MediaBrowserPrototype } from "./MediaBrowserPrototype"

const meta = {
  title: "Design Prototypes/Media Browser",
  component: MediaBrowserPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof MediaBrowserPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
}

