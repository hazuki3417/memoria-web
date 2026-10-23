import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { UsageFileSize } from "./UsageFileSize"

const meta = {
  title: "Features/Settings/Usage/File Size",
  component: UsageFileSize,
  args: {
    bytes: 1_240_000_000,
    fileSizeUnit: "DECIMAL",
  },
} satisfies Meta<typeof UsageFileSize>

export default meta
type Story = StoryObj<typeof meta>

export const Decimal: Story = {
  name: "Decimal（GB）",
  tags: ["visual"],
}

export const Binary: Story = {
  name: "Binary（GiB）",
  tags: ["visual"],
  args: { fileSizeUnit: "BINARY" },
}

export const Zero: Story = {
  name: "0 GB",
  tags: ["visual"],
  args: { bytes: 0 },
}

export const Small: Story = {
  name: "小さいbyte数",
  tags: ["visual"],
  args: { bytes: 1000 },
}

export const DisplayContract: Story = {
  name: "Interaction · 値と単位の表示",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("1.24 GB")).toBeVisible()
  },
}
