import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { MediaBrowserGroupModal } from "./MediaBrowserGroupModal"

const meta = {
  title: "Features/Media Browser/Group Modal",
  component: MediaBrowserGroupModal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    selected: new Set(["media-1", "media-2"]),
    groupActionPending: false,
    groupActionResult: null,
    groupActionError: null,
    groupTargets: [],
    onTargetsChange: fn(),
    groupOptions: [{ value: "family", label: "家族" }],
    items: [],
    onClose: fn(),
    onAddToGroups: fn(async () => undefined),
    onDismissGroupActionResult: fn(),
    onRetryGroupOptions: fn(),
  },
} satisfies Meta<typeof MediaBrowserGroupModal>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Group selection",
  tags: ["visual", "vrt", "vrt-modal"],
}
export const Pending: Story = {
  name: "Visual · Processing",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { groupActionPending: true, groupTargets: ["family"] },
}
export const ErrorState: Story = {
  name: "Visual · Error",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { groupActionError: "Groupを読み込めませんでした。" },
}
export const Cancel: Story = {
  tags: ["interaction"],
  play: async ({ args }) => {
    const modal = within(
      await within(document.body).findByRole("dialog", { name: "Groupに追加" }),
    )
    await userEvent.click(modal.getByRole("button", { name: "キャンセル" }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await expect(args.onDismissGroupActionResult).toHaveBeenCalledTimes(1)
    await expect(args.onAddToGroups).not.toHaveBeenCalled()
  },
}
