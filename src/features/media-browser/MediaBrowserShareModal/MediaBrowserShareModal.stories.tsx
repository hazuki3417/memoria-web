import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { MediaBrowserShareModal } from "./MediaBrowserShareModal"

const meta = {
  title: "Features/Media Browser/Share Modal",
  component: MediaBrowserShareModal,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    selectedCount: 2,
    communityTarget: null,
    onTargetChange: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof MediaBrowserShareModal>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: "Visual · Choose community", tags: ["visual", "vrt", "vrt-modal"] }
export const Selected: Story = { name: "Visual · Community selected", tags: ["visual", "vrt", "vrt-modal"], args: { communityTarget: "Photo Club" } }
export const Cancel: Story = {
  tags: ["interaction"],
  play: async ({ args }) => {
    const modal = within(await within(document.body).findByRole("dialog", { name: "Communityへ共有" }))
    await userEvent.click(modal.getByRole("button", { name: "キャンセル" }))
    await expect(args.onClose).toHaveBeenCalledTimes(1)
  },
}
