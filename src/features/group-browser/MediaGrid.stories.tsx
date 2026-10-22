import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { MediaGrid } from "./MediaGrid"

const meta = {
  title: "Features/Group Browser/Media Grid",
  component: MediaGrid,
  args: {
    onOpen: fn(),
    items: [
      { id: "a", label: "写真A", src: "/__dev-assets/group-browser/group-media-01.jpg" },
      { id: "b", label: "写真B", src: null },
      { id: "c", label: "写真C", src: "/__dev-assets/group-browser/group-media-02.jpg" },
    ],
  },
} satisfies Meta<typeof MediaGrid>
export default meta
type Story = StoryObj<typeof meta>

export const OpensSelectedMedia: Story = {
  name: "Interaction · Opens Selected Media",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const media = canvas.getByRole("button", { name: "写真Cの詳細を開く" })
    await userEvent.click(media)
    await expect(args.onOpen).toHaveBeenCalledExactlyOnceWith(2)
  },
}

export const MissingPreviewStillOpens: Story = {
  name: "Interaction · Missing Preview Still Opens",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const media = canvas.getByRole("button", {
      name: "写真Bの詳細を開く（画像プレビューなし）",
    })
    await expect(canvas.getByText("写真B")).toBeVisible()
    await userEvent.click(media)
    await expect(args.onOpen).toHaveBeenCalledExactlyOnceWith(1)
  },
}

export const KeyboardOpensMedia: Story = {
  name: "Interaction · Keyboard Opens Media",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const media = canvas.getByRole("button", { name: "写真Aの詳細を開く" })
    media.focus()
    await expect(media).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(args.onOpen).toHaveBeenCalledExactlyOnceWith(0)
  },
}

export const EmptyMedia: Story = {
  name: "Interaction · Empty Media",
  tags: ["interaction"],
  args: { items: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryAllByRole("button")).toHaveLength(0)
    await expect(args.onOpen).not.toHaveBeenCalled()
  },
}
