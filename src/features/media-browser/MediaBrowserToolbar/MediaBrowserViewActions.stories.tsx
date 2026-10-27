import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { MediaBrowserViewActions } from "./MediaBrowserViewActions"

const meta = {
  title: "Features/Media Browser/MediaBrowserViewActions",
  component: MediaBrowserViewActions,
  args: { context: "personal", communityId: "community-1", navigate: fn() },
} satisfies Meta<typeof MediaBrowserViewActions>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = { tags: ["visual"] }
export const Community: Story = { args: { context: "community" }, tags: ["visual"] }
