import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "storybook/test"
import { GroupBrowser, type GroupBrowserGroup } from "./GroupBrowser"

// Reviewable screen states. Visual stories are intentionally excluded from VRT until approved (`vrt` tag absent).
// All states render the production Feature; no alternate screen markup is introduced.
const sampleGroups: GroupBrowserGroup[] = [
  { id: "photos", name: "旅行の写真", mediaCount: 12, previewCount: 4, parentNames: [], childNames: ["風景"] },
  { id: "landscape", name: "風景", mediaCount: 4, previewCount: 3, parentNames: ["旅行の写真"], childNames: [] },
  { id: "new", name: "まだMediaのないGroup", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
]

const meta = {
  title: "Features/Group Browser/Screen States",
  component: GroupBrowser,
  parameters: { layout: "fullscreen" },
  tags: ["visual"],
  args: {
    groupsData: sampleGroups,
    mediaItemsData: [],
    relationCandidates: sampleGroups.map((group) => group.name),
  },
} satisfies Meta<typeof GroupBrowser>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Discovery · With Groups",
}

export const Empty: Story = {
  name: "Visual · Discovery · No Groups",
  args: { groupsData: [], relationCandidates: [] },
}

export const EmptyCommunityMember: Story = {
  name: "Visual · Discovery · No Groups · Read Only",
  args: {
    contextKind: "community",
    groupsData: [],
    relationCandidates: [],
    canManage: false,
    hideManagementActions: true,
  },
}

export const SearchEmpty: Story = {
  name: "Visual · Discovery · Search No Results",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByPlaceholderText("Groupを検索"), "一致しない検索語{Enter}")
    await canvas.findByText("一致するGroupがありません")
  },
}

export const Loading: Story = {
  name: "Visual · Discovery · Initial Loading",
  args: { groupsData: [], discoveryState: "loading" },
}

export const Error: Story = {
  name: "Visual · Discovery · Load Error",
  args: { groupsData: [], discoveryState: "error", onRetryDiscovery: () => {} },
}

export const CompactDefault: Story = {
  name: "Visual · Compact · Discovery With Groups",
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactEmpty: Story = {
  name: "Visual · Compact · Discovery No Groups",
  args: { groupsData: [], relationCandidates: [] },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactSearchEmpty: Story = {
  name: "Visual · Compact · Discovery Search No Results",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByPlaceholderText("Groupを検索"), "一致しない検索語{Enter}")
    await canvas.findByText("一致するGroupがありません")
  },
}

export const CompactLoading: Story = {
  name: "Visual · Compact · Discovery Initial Loading",
  args: { groupsData: [], discoveryState: "loading" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactError: Story = {
  name: "Visual · Compact · Discovery Load Error",
  args: { groupsData: [], discoveryState: "error", onRetryDiscovery: () => {} },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}


export const DiscoveryLoadingMore: Story = {
  name: "Visual · Discovery · Loading More",
  args: { discoveryState: "ready", discoveryPageState: "loading" },
}
export const DiscoveryLoadMoreError: Story = {
  name: "Visual · Discovery · Load More Error",
  args: { discoveryState: "ready", discoveryPageState: "error", onRetryDiscoveryPage: () => {} },
}
export const CompactDiscoveryLoadingMore: Story = {
  name: "Visual · Compact · Discovery Loading More",
  args: { discoveryState: "ready", discoveryPageState: "loading" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactDiscoveryLoadMoreError: Story = {
  name: "Visual · Compact · Discovery Load More Error",
  args: { discoveryState: "ready", discoveryPageState: "error", onRetryDiscoveryPage: () => {} },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
