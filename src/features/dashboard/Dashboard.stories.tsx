import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { Dashboard } from "./Dashboard"

const image = "/__dev-assets/media-browser/h-01.png"

const meta = {
  title: "Features/Dashboard",
  component: Dashboard,
  args: {
    contextKind: "personal",
    mediaState: "ready",
    groupState: "ready",
    mediaItems: [image, image, image],
    groupItems: [{
      id: "group-1",
      name: "最近のGroup",
      mediaCount: 5,
      media: [image, image, image, image],
    }],
  },
} satisfies Meta<typeof Dashboard>
export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {
  name: "Personal",
  tags: ["visual"],
}
export const Community: Story = {
  name: "Community",
  tags: ["visual"],
  args: { contextKind: "community", communityId: "community-123" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const links = canvas.getAllByRole("link", { name: "すべて見る" })
    await expect(links[0]).toHaveAttribute("href", "/communities/community-123/media")
    await expect(links[1]).toHaveAttribute("href", "/communities/community-123/groups")
  },
}
export const IndependentEmptyStates: Story = {
  name: "Independent Empty States",
  tags: ["visual"],
  args: { mediaItems: [], groupItems: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("メディアはまだありません")).toBeVisible()
    await expect(canvas.getByText("Groupはまだありません")).toBeVisible()
  },
}
export const LoadingMediaOnly: Story = {
  name: "Loading Media Only",
  tags: ["visual"],
  args: { mediaState: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("最近のGroup")).toBeVisible()
    await expect(canvas.getByRole("status")).toBeVisible()
  },
}
export const FailedGroupsOnly: Story = {
  name: "Failed Groups Only",
  tags: ["visual"],
  args: { groupState: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Groupを取得できませんでした")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeVisible()
    await expect(canvas.getAllByRole("link", { name: "すべて見る" })).toHaveLength(1)
  },
}
export const MissingThumbnail: Story = {
  name: "Missing Thumbnail",
  tags: ["visual"],
  args: { mediaItems: [""] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText("サムネイルを表示できません")).toBeVisible()
  },
}
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
