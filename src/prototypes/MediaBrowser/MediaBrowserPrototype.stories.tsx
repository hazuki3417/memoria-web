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
  name: "Visual · Default",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
}
export const TagFiltered: Story = {
  name: "Visual · Tag Filtered",
  tags: ["visual"],
  args: { initialState: "tag-filtered", contextKind: "personal" },
}
export const TrueEmpty: Story = {
  name: "Visual · True Empty",
  tags: ["visual"],
  args: { initialState: "true-empty", contextKind: "personal" },
}
export const FilteredEmpty: Story = {
  name: "Visual · Filtered Empty",
  tags: ["visual"],
  args: { initialState: "filtered-empty", contextKind: "personal" },
}
export const Loading: Story = {
  name: "Visual · Loading",
  tags: ["visual"],
  args: { initialState: "loading", contextKind: "personal" },
}
export const LoadError: Story = {
  name: "Visual · Load Error",
  tags: ["visual"],
  args: { initialState: "error", contextKind: "personal" },
}
export const LoadingMore: Story = {
  name: "Visual · Loading More",
  tags: ["visual"],
  args: { initialState: "loading-more", contextKind: "personal" },
}
export const LoadMoreError: Story = {
  name: "Visual · Load More Error",
  tags: ["visual"],
  args: { initialState: "load-more-error", contextKind: "personal" },
}
export const ProcessingFailure: Story = {
  name: "Visual · Processing Failure",
  tags: ["visual"],
  args: { initialState: "processing-failure", contextKind: "personal" },
}
export const Selection: Story = {
  name: "Visual · Selection",
  tags: ["visual"],
  args: { initialState: "selection", contextKind: "personal" },
}

export const Community: Story = {
  name: "Visual · Community",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "community" },
}

export const CommunitySelection: Story = {
  name: "Visual · Community Selection",
  tags: ["visual"],
  args: { initialState: "selection", contextKind: "community" },
}

export const GroupDialog: Story = {
  name: "Visual · Group Dialog",
  tags: ["visual"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "group",
  },
}
export const ShareDialog: Story = {
  name: "Visual · Share Dialog",
  tags: ["visual"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "share",
  },
}
export const DeleteDialog: Story = {
  name: "Visual · Delete Dialog",
  tags: ["visual"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "delete",
  },
}
export const CompactDeleteDialog: Story = {
  name: "Visual · Compact Delete Dialog",
  tags: ["visual"],
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "delete",
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Compact: Story = {
  name: "Visual · Compact",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactSelection: Story = {
  name: "Visual · Compact Selection",
  tags: ["visual"],
  args: { initialState: "selection", contextKind: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactCommunity: Story = {
  name: "Visual · Compact Community",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "community" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
