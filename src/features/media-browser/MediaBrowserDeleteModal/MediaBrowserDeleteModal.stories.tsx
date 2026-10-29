import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { MediaBrowserDeleteModal } from "./MediaBrowserDeleteModal"

const meta = {
  title: "Features/Media Browser/Delete Modal",
  component: MediaBrowserDeleteModal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    selectedCount: 3,
    onClose: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof MediaBrowserDeleteModal>

export default meta
type Story = StoryObj<typeof meta>

export const Confirmation: Story = {
  name: "Visual · Delete confirmation",
  tags: ["visual", "vrt", "vrt-modal"],
}

export const Cancel: Story = {
  name: "Interaction · Cancel",
  tags: ["interaction"],
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Mediaを削除" }))
    await expect(dialog.getByText("選択した3件のMediaを削除します。削除したMediaは復元できません。")).toBeVisible()
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await expect(args.onDelete).not.toHaveBeenCalled()
  },
}

export const Delete: Story = {
  name: "Interaction · Delete",
  tags: ["interaction"],
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Mediaを削除" }))
    await userEvent.click(dialog.getByRole("button", { name: "削除" }))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
    await expect(args.onClose).not.toHaveBeenCalled()
  },
}
