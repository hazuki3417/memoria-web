import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { MediaBrowserToolbar } from "./MediaBrowserToolbar"

const meta = {
  title: "Features/Media Browser/MediaBrowserToolbar",
  component: MediaBrowserToolbar,
  args: {
    compact: false,
    selecting: false,
    selected: new Set<string>(),
    tags: [],
    setTags: fn(),
    onSubmitTags: fn(),
    tagOptions: ["旅行", "風景"],
    context: "personal",
    communityId: "community-1",
    hasRemoteItems: false,
    navigate: fn(),
    onSelectionDialog: fn(),
    onStartSelection: fn(),
    onEndSelection: fn(),
  },
} satisfies Meta<typeof MediaBrowserToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const View: Story = { tags: ["visual"] }
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }
export const Selecting: Story = {
  args: { selecting: true, selected: new Set(["media-1"]) },
  tags: ["visual"],
}
export const Community: Story = {
  args: { context: "community" },
  tags: ["visual"],
}
