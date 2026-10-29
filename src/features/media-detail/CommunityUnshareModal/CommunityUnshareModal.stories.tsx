import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityUnshareModal } from "./CommunityUnshareModal"

const meta = {
  title: "Features/Media Detail/CommunityUnshareModal",
  component: CommunityUnshareModal,
  parameters: { layout: "fullscreen" },
  args: {
    unshareTarget: "Photo Club",
    setUnshareTarget: fn(),
    removeCommunityShare: fn(),
  },
} satisfies Meta<typeof CommunityUnshareModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual", "vrt", "vrt-modal"],
}

export const Cancel: Story = {
  name: "Interaction · Cancel",
  tags: ["interaction"],
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Communityの共有を解除" }))
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.setUnshareTarget).toHaveBeenCalledTimes(1)
    await expect(args.removeCommunityShare).not.toHaveBeenCalled()
  },
}

export const Confirm: Story = {
  name: "Interaction · Confirm",
  tags: ["interaction"],
  args: {  },
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Communityの共有を解除" }))
    await userEvent.click(dialog.getByRole("button", { name: "共有解除" }))
    await expect(args.removeCommunityShare).toHaveBeenCalledTimes(1)
    await expect(args.setUnshareTarget).not.toHaveBeenCalled()
  },
}
