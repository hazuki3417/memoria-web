import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { AccountMenuProfile } from "./AccountMenuProfile"

const meta = {
  title: "Features/Application Shell/Account Menu/Profile",
  component: AccountMenuProfile,
  args: {
    state: {
      status: "ready",
      displayName: "ユーザー",
      contextLabel: "Personal",
    },
  },
} satisfies Meta<typeof AccountMenuProfile>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Visual · Ready",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("ユーザー")).toBeVisible()
    await expect(within(canvasElement).getByText("Personal")).toBeVisible()
  },
}

export const AvatarLabel: Story = {
  name: "Visual · Avatar Label",
  tags: ["visual"],
  args: {
    state: { status: "ready", displayName: "Memoria", avatarLabel: "M", contextLabel: "旅行の思い出" },
  },
}

export const Loading: Story = {
  name: "Visual · Loading Skeleton",
  tags: ["visual"],
  args: { state: { status: "loading" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText("プロフィールを読み込み中")).toHaveAttribute("aria-busy", "true")
  },
}

export const Error: Story = {
  name: "Visual · Error",
  tags: ["visual"],
  args: { state: { status: "error" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("ユーザー情報を取得できませんでした")).toBeVisible()
  },
}
