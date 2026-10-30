import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import type { MediaItem } from "../types"
import { MediaDeleteModal } from "./MediaDeleteModal"

const media: MediaItem = {
  id: "portrait-01",
  label: "縦長 Media 1",
  src: "/__dev-assets/media-browser/h-01.png",
}

const meta = {
  title: "Features/Media Detail/MediaDeleteModal",
  component: MediaDeleteModal,
  parameters: { layout: "fullscreen" },
  args: {
    target: media,
    onCancel: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof MediaDeleteModal>

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
      await within(document.body).findByRole("dialog", { name: "Mediaを削除" }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.onCancel).toHaveBeenCalledTimes(1)
    await expect(args.onConfirm).not.toHaveBeenCalled()
  },
}

export const Confirm: Story = {
  name: "Interaction · Confirm",
  tags: ["interaction"],
  args: {},
  play: async ({ args }) => {
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Mediaを削除" }),
    )
    await userEvent.click(dialog.getByRole("button", { name: "削除" }))
    await expect(args.onConfirm).toHaveBeenCalledTimes(1)
    await expect(args.onCancel).not.toHaveBeenCalled()
  },
}
