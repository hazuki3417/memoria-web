import { LayoutStory } from "./LayoutStory"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "Features/Settings/Loading & Error Layout",
  component: LayoutStory,
  args: { context: "personal", state: "loading", compact: false },
} satisfies Meta<typeof LayoutStory>

export default meta
type Story = StoryObj<typeof meta>

export const PersonalLoading: Story = {
  name: "Visual · Personal / 読み込み中",
  tags: ["visual"],
}
export const PersonalError: Story = {
  name: "Visual · Personal / 取得失敗",
  tags: ["visual", "vrt"],
  args: { state: "error" },
}
export const CommunityLoading: Story = {
  name: "Visual · Community / 読み込み中",
  tags: ["visual"],
  args: { context: "community" },
}
export const CommunityError: Story = {
  name: "Visual · Community / 取得失敗",
  tags: ["visual", "vrt"],
  args: { context: "community", state: "error" },
}
export const CommunityCompactLoading: Story = {
  name: "Visual · Community Mobile / 読み込み中",
  tags: ["visual"],
  args: { context: "community", compact: true },
}
export const CommunityCompactError: Story = {
  name: "Visual · Community Mobile / 取得失敗",
  tags: ["visual", "vrt"],
  args: { context: "community", compact: true, state: "error" },
}
