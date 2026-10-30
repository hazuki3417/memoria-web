import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { TagsEditModal } from "./TagsEditModal"

const meta = {
  title: "Features/Media Detail/TagsEditModal",
  component: TagsEditModal,
  parameters: { layout: "fullscreen" },
  args: {
    detailEditor: "tags",
    setDetailEditor: fn(),
    detailDraft: ["旅行"],
    setDetailDraft: () => undefined,
    saveDetailDraft: fn(),
  },
} satisfies Meta<typeof TagsEditModal>

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
      await within(document.body).findByRole("dialog", { name: "Tagsを編集" }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.setDetailEditor).toHaveBeenCalledTimes(1)
    await expect(args.saveDetailDraft).not.toHaveBeenCalled()
  },
}

export const Confirm: Story = {
  name: "Interaction · Confirm",
  tags: ["interaction"],
  args: {},
  play: async ({ args }) => {
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Tagsを編集" }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "変更を反映" }))
    await expect(args.saveDetailDraft).toHaveBeenCalledTimes(1)
    await expect(args.setDetailEditor).not.toHaveBeenCalled()
  },
}
