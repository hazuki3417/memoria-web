import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityCreateModal } from "./CommunityCreateModal"

const meta = {
  title: "Features/Application Shell/Community Create Modal",
  component: CommunityCreateModal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    onClose: fn(),
    name: "",
    onNameChange: fn(),
    error: "",
    onErrorClear: fn(),
    busy: false,
    communitiesError: false,
    onCreate: fn(),
  },
} satisfies Meta<typeof CommunityCreateModal>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: "Visual · Empty",
  tags: ["visual", "vrt", "vrt-modal"],
}
export const NameEntered: Story = {
  name: "Visual · Name Entered",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { name: "家族のアルバム" },
}
export const ValidationError: Story = {
  name: "Visual · Validation Error",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { name: "家族", error: "Communityを作成できませんでした。再度お試しください。" },
}
export const CommunitiesError: Story = {
  name: "Visual · Communities Error",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { communitiesError: true },
}
export const Creating: Story = {
  name: "Visual · Creating",
  tags: ["visual", "vrt", "vrt-modal"],
  args: { name: "家族のアルバム", busy: true },
}

export const Cancel: Story = {
  name: "Interaction · Cancel",
  tags: ["interaction"],
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Communityを作成" }))
    await expect(dialog.queryByRole("button", { name: "Close modal" })).not.toBeInTheDocument()
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
    await expect(args.onCreate).not.toHaveBeenCalled()
  },
}
export const Submit: Story = {
  name: "Interaction · Submit",
  tags: ["interaction"],
  args: { name: "家族のアルバム" },
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Communityを作成" }))
    await userEvent.click(dialog.getByRole("button", { name: "Communityを作成" }))
    await expect(args.onCreate).toHaveBeenCalledTimes(1)
    await expect(args.onClose).not.toHaveBeenCalled()
  },
}
