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
export const TagFiltered: Story = {
  name: "Tag Filtered",
  tags: ["visual"],
  args: { initialState: "tag-filtered", contextKind: "personal" },
}
export const TrueEmpty: Story = {
  name: "True Empty",
  tags: ["visual"],
  args: { initialState: "true-empty", contextKind: "personal" },
}
export const FilteredEmpty: Story = {
  name: "Filtered Empty",
  tags: ["visual"],
  args: { initialState: "filtered-empty", contextKind: "personal" },
}
export const Loading: Story = {
  name: "Loading",
  tags: ["visual"],
  args: { initialState: "loading", contextKind: "personal" },
}
export const LoadError: Story = {
  name: "Load Error",
  tags: ["visual"],
  args: { initialState: "error", contextKind: "personal" },
}
export const LoadingMore: Story = {
  name: "Loading More",
  tags: ["visual"],
  args: { initialState: "loading-more", contextKind: "personal" },
}
export const LoadMoreError: Story = {
  name: "Load More Error",
  tags: ["visual"],
  args: { initialState: "load-more-error", contextKind: "personal" },
}
export const ProcessingFailure: Story = {
  name: "Processing Failure",
  tags: ["visual"],
  args: { initialState: "processing-failure", contextKind: "personal" },
}
export const Selection: Story = {
  name: "Selection",
  tags: ["visual"],
  args: { initialState: "selection", contextKind: "personal" },
}

export const Community: Story = {
  name: "Community",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "community" },
}

export const CommunitySelection: Story = {
  name: "Community Selection",
  tags: ["visual"],
  args: { initialState: "selection", contextKind: "community" },
}

export const GroupDialog: Story = {
  name: "Group Dialog",
  tags: ["visual", "vrt", "vrt-modal"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "group",
  },
}
export const ShareDialog: Story = {
  name: "Share Dialog",
  tags: ["visual", "vrt", "vrt-modal"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "share",
  },
}
export const DeleteDialog: Story = {
  name: "Delete Dialog",
  tags: ["visual", "vrt", "vrt-modal"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "delete",
  },
}
export const CompactDeleteDialog: Story = {
  name: "Compact Delete Dialog",
  tags: ["visual", "vrt", "vrt-modal"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "delete",
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactSelection: Story = {
  name: "Compact Selection",
  tags: ["visual"],
  args: { initialState: "selection", contextKind: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactCommunity: Story = {
  name: "Compact Community",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "community" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
