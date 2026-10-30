import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityShareModal } from "./CommunityShareModal"

const meta = {
  title: "Features/Media Detail/CommunityShareModal",
  component: CommunityShareModal,
  parameters: { layout: "fullscreen" },
  args: {
    detailEditor: "communities",
    setDetailEditor: fn(),
    detailValues: {
      tags: ["旅行"],
      groups: ["旅行"],
      communities: ["Photo Club"],
    },
    shareTarget: null,
    setShareTarget: () => undefined,
    addCommunityShare: fn(),
  },
} satisfies Meta<typeof CommunityShareModal>

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
    const dialog = within(
      await within(document.body).findByRole("dialog", {
        name: "Communityへ共有",
      }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.setDetailEditor).toHaveBeenCalledTimes(1)
    await expect(args.addCommunityShare).not.toHaveBeenCalled()
  },
}

export const Confirm: Story = {
  name: "Interaction · Confirm",
  tags: ["interaction"],
  args: { shareTarget: "Family" },
  play: async ({ args }) => {
    const dialog = within(
      await within(document.body).findByRole("dialog", {
        name: "Communityへ共有",
      }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "共有する" }))
    await expect(args.addCommunityShare).toHaveBeenCalledTimes(1)
    await expect(args.setDetailEditor).not.toHaveBeenCalled()
  },
}
