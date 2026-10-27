import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { MediaBrowserListContent } from "./MediaBrowserListContent"

const meta = {
  title: "Features/Media Browser/MediaBrowserListContent",
  component: MediaBrowserListContent,
  args: {
    activeState: "true-empty",
    context: "personal",
    communityId: "community-1",
    items: [],
    hasRemoteItems: false,
    selecting: false,
    selected: new Set<string>(),
    onToggle: fn(),
    onOpenDetail: fn(),
    navigate: fn(),
    onClearTags: fn(),
    onRetry: fn(),
    onLoadMore: fn(),
    hasMore: false,
    loadingMore: false,
    loadMoreError: false,
  },
} satisfies Meta<typeof MediaBrowserListContent>
export default meta
type Story = StoryObj<typeof meta>
export const Empty: Story = { tags: ["visual"] }
export const FilteredEmpty: Story = { args: { activeState: "filtered-empty" }, tags: ["visual"] }
export const Loading: Story = { args: { activeState: "loading" }, tags: ["visual"] }
export const Error: Story = { args: { activeState: "error" }, tags: ["visual"] }
export const LoadingMore: Story = { args: { activeState: "loading-more", loadingMore: true }, tags: ["visual"] }
export const LoadMoreError: Story = { args: { activeState: "load-more-error", loadMoreError: true }, tags: ["visual"] }
