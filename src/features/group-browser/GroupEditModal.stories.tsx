import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { GroupEditModal } from "./GroupEditModal"

const meta = {
  title: "Features/Group Browser/Edit Dialog",
  component: GroupEditModal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    name: "アルバムA",
    parents: ["親Group"],
    children: ["子Group"],
    candidates: ["親Group", "子Group"],
    currentGroupName: "アルバムA",
    canManage: true,
    detailsReady: true,
    conflictNeedsReview: false,
    saving: false,
    onNameChange: fn(),
    onParentsChange: fn(),
    onChildrenChange: fn(),
    onDelete: fn(),
    onClose: fn(),
    onSubmit: fn(async () => undefined),
  },
} satisfies Meta<typeof GroupEditModal>

export default meta
type Story = StoryObj<typeof meta>

/** GB-041/051: 名前とRelationの既存Draftを独立して表示できる。 */
export const Draft: Story = {
  name: "Visual · Draft",
  tags: ["visual", "vrt", "vrt-modal"],
}

/** GB-054: 競合結果の確認待ちでは再保存できない。 */
export const ConflictReview: Story = {
  name: "Visual · Conflict Review",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { conflictNeedsReview: true },
}

/** GB-056: 保存処理中は再保存できない。 */
export const Saving: Story = {
  name: "Visual · Saving",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { saving: true },
}

/** GB-046: Cancelは保存処理を呼ばない。 */
export const Cancel: Story = {
  name: "Interaction · Cancel",
  tags: ["interaction"],
  play: async ({ args }) => {
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Groupを編集" }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}
