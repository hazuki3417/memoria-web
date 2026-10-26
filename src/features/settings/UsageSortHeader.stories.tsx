import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { UsageSortHeader } from "./UsageSortHeader"

const meta = {
  title: "Features/Settings/Usage/Sort Header",
  component: UsageSortHeader,
  args: {
    label: "使用量",
    direction: null,
    align: "right",
    disabled: false,
    onSort: fn(),
  },
} satisfies Meta<typeof UsageSortHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Unsorted: Story = {
  name: "Visual · 未ソート",
  tags: ["visual"],
}

export const Ascending: Story = {
  name: "Visual · 昇順",
  tags: ["visual"],
  args: { direction: "asc" },
}

export const Descending: Story = {
  name: "Visual · 降順",
  tags: ["visual"],
  args: { direction: "desc" },
}

export const LeftAligned: Story = {
  name: "Visual · 形式列（左揃え）",
  tags: ["visual"],
  args: { label: "形式", align: "left" },
}

export const Disabled: Story = {
  name: "Visual · Loading時の操作不可",
  tags: ["visual"],
  args: { disabled: true },
}

export const IconContract: Story = {
  name: "Interaction · ソートアイコン表示",
  tags: ["interaction"],
  args: { direction: "asc" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { name: "使用量で並べ替え" })).toBeEnabled()
    await expect(canvas.getByTestId("usage-sort-icon-asc")).toHaveAttribute("aria-hidden", "true")
    await expect(canvas.queryByText("▲")).not.toBeInTheDocument()
  },
}

export const KeyboardContract: Story = {
  name: "Interaction · キーボード操作",
  tags: ["interaction"],
  args: { direction: "desc" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: "使用量で並べ替え" })
    button.focus()
    await expect(button).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(args.onSort).toHaveBeenCalledTimes(1)
    await expect(canvas.getByTestId("usage-sort-icon-desc")).toBeInTheDocument()
  },
}
