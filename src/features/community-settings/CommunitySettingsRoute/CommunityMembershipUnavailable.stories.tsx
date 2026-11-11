import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityMembershipUnavailable } from "./CommunityMembershipUnavailable"

const meta = {
  title: "Features/Community Settings/Membership Unavailable",
  component: CommunityMembershipUnavailable,
  args: {
    onReturnToDashboard: fn(),
  },
} satisfies Meta<typeof CommunityMembershipUnavailable>

export default meta
type Story = StoryObj<typeof meta>

export const NotMember: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText("このCommunityには所属していません"),
    ).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "ダッシュボードへ戻る" }))
    await expect(args.onReturnToDashboard).toHaveBeenCalledTimes(1)
  },
}
