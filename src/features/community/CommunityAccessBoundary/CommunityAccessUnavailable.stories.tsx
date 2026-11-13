import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityAccessUnavailable } from "./CommunityAccessUnavailable"

const meta = {
  title: "Features/Community/Access Unavailable",
  component: CommunityAccessUnavailable,
  args: {
    onReturnToDashboard: fn(),
  },
} satisfies Meta<typeof CommunityAccessUnavailable>

export default meta
type Story = StoryObj<typeof meta>

export const Visual: Story = {
  name: "Visual · Communityを表示できない",
  tags: ["visual"],
}

export const ReturnToDashboard: Story = {
  name: "Interaction · ダッシュボードへ戻る",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText("このCommunityを表示できません"),
    ).toBeVisible()
    await userEvent.click(
      canvas.getByRole("button", { name: "ダッシュボードへ戻る" }),
    )
    await expect(args.onReturnToDashboard).toHaveBeenCalledTimes(1)
  },
}
