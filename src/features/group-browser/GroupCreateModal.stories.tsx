import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { GroupCreateModal } from "./GroupCreateModal"

const meta = {
  title: "Features/Group Browser/Create Modal",
  component: GroupCreateModal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    name: "",
    parents: [],
    children: [],
    candidates: [],
    canManage: true,
    saving: false,
    onNameChange: fn(),
    onParentsChange: fn(),
    onChildrenChange: fn(),
    onClose: fn(),
    onSubmit: fn(),
  },
} satisfies Meta<typeof GroupCreateModal>

export default meta
type Story = StoryObj<typeof meta>

/** GB-030: Group名入力・Relation選択・操作を独立表示できる。 */
export const EmptyDraft: Story = {
  name: "Visual · Empty Draft",
  tags: ["visual", "vrt", "vrt-modal"],
}

/** GB-031: 作成直前のParent・Child選択状態。 */
export const ReadyToCreate: Story = {
  name: "Visual · Ready To Create",
  tags: ["visual", "vrt", "vrt-modal"],
  args: {
    name: "新しいGroup",
    parents: ["親Group"],
    children: ["子Group"],
    candidates: ["親Group", "子Group"],
  },
}

/** GB-035: 非同期処理中は二重送信を防ぐ。 */
export const Saving: Story = {
  name: "Visual · Saving",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { name: "新しいGroup", saving: true },
}

/** GB-034: Cancelで作成Mutationを実行しない。 */
export const Cancel: Story = {
  name: "Interaction · Cancel",
  tags: ["interaction"],
  play: async ({ args }) => {
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Groupを作成" }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

export const Submit: Story = {
  name: "Interaction · Submit",
  tags: ["interaction"],
  args: { name: "新しいGroup" },
  play: async ({ args }) => {
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Groupを作成" }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "作成" }))
    await expect(args.onSubmit).toHaveBeenCalledTimes(1)
    await expect(args.onClose).not.toHaveBeenCalled()
  },
}
