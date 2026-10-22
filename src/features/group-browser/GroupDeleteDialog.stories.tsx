import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { GroupDeleteDialog } from "./GroupDeleteDialog"

const meta = {
  title: "Features/Group Browser/Delete Dialog",
  component: GroupDeleteDialog,
  args: {
    opened: true,
    name: "アルバムA",
    saving: false,
    canManage: true,
    onClose: fn(),
    onConfirm: fn(async () => undefined),
  },
} satisfies Meta<typeof GroupDeleteDialog>

export default meta
type Story = StoryObj<typeof meta>

/** GB-059: 削除対象と影響範囲を示し、名前再入力を要求しない。 */
export const Confirmation: Story = {
  name: "Visual · Confirmation",
  tags: ["visual"],
}

/** GB-066: 処理中はCancelと確定操作を禁止する。 */
export const Saving: Story = {
  name: "Visual · Saving",
  tags: ["visual"],
  args: { saving: true },
}

/** GB-060: Cancelは削除を実行しない。 */
export const Cancel: Story = {
  name: "Interaction · Cancel",
  tags: ["interaction"],
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを削除" }))
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await expect(args.onConfirm).not.toHaveBeenCalled()
  },
}
