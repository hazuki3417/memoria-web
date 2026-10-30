import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { MediaBrowserSelectionActions } from "./MediaBrowserSelectionActions"

const meta = {
  title: "Features/Media Browser/MediaBrowserSelectionActions",
  component: MediaBrowserSelectionActions,
  args: {
    selected: new Set(["media-1", "media-2"]),
    context: "personal",
    communityId: "community-1",
    hasRemoteItems: false,
    navigate: fn(),
    onSelectionDialog: fn(),
  },
} satisfies Meta<typeof MediaBrowserSelectionActions>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = { tags: ["visual"] }
export const Community: Story = {
  args: { context: "community" },
  tags: ["visual"],
}
export const Empty: Story = { args: { selected: new Set() }, tags: ["visual"] }
export const RemoteItems: Story = {
  args: { hasRemoteItems: true },
  tags: ["visual"],
}
