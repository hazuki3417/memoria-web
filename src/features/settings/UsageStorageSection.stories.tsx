import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { UsageStorageSection } from "./UsageStorageSection"
import { sampleUsage, zeroUsage } from "./usageStoryFixtures"

const meta = {
  title: "Features/Settings/Usage/Storage",
  component: UsageStorageSection,
  args: {
    usage: sampleUsage,
    status: "ready",
    fileSizeUnit: "DECIMAL",
  },
} satisfies Meta<typeof UsageStorageSection>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Ready（Decimal）",
  tags: ["visual"],
}

export const ReadyCompact: Story = {
  name: "Ready（Compact）",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Loading: Story = {
  name: "Loading",
  tags: ["visual"],
  args: { status: "loading" },
}

export const Empty: Story = {
  name: "使用量0",
  tags: ["visual"],
  args: { usage: zeroUsage },
}

export const Binary: Story = {
  name: "Binary単位",
  tags: ["visual"],
  args: { fileSizeUnit: "BINARY" },
}

export const BinaryContract: Story = {
  name: "Interaction · Binary表示",
  tags: ["interaction"],
  args: { fileSizeUnit: "BINARY" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("4.66 GiB")).toBeVisible()
    await expect(canvas.getByLabelText(/ストレージ使用率 24.8%/)).toBeInTheDocument()
  },
}

export const Percent: Story = {
  name: "割合表示",
  tags: ["visual"],
  args: { displayMode: "percent" },
}
