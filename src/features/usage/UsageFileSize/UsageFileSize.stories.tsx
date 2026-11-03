import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { UsageFileSize } from "./UsageFileSize"

const meta = {
  title: "features/usage/UsageFileSize",
  component: UsageFileSize,
  args: {
    bytes: 1_240_000_000,
    fileSizeUnit: "DECIMAL",
  },
} satisfies Meta<typeof UsageFileSize>

export default meta
type Story = StoryObj<typeof meta>

// Visual: 表示状態・VRT候補（既存のStory ID・タグを維持）
export const Decimal: Story = {
  name: "Visual · Decimal（GB）",
  tags: ["visual"],
}

export const Binary: Story = {
  name: "Visual · Binary（GiB）",
  tags: ["visual"],
  args: { fileSizeUnit: "BINARY" },
}

export const Zero: Story = {
  name: "Visual · 0 GB",
  tags: ["visual"],
  args: { bytes: 0 },
}

export const Small: Story = {
  name: "Visual · 小さいbyte数",
  tags: ["visual"],
  args: { bytes: 1000 },
}

// Interaction: 振る舞い・接続契約
export const DisplayContract: Story = {
  name: "Interaction · 値と単位の表示",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("1.24 GB")).toBeVisible()
  },
}
