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

// APIが返した順序に関係なく、Storageバーの各形式は使用量降順。
const reorderedUsage = {
  ...sampleUsage,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeBytes: 40_000_000 },
    { format: "WebP", count: 100, sizeBytes: 100_000_000 },
    { format: "PNG", count: 200, sizeBytes: 200_000_000 },
    { format: "HEIC / HEIF", count: 48, sizeBytes: 900_000_000 },
  ],
}

export const ProgressOrderContract: Story = {
  name: "Interaction · Storageバーは使用量降順",
  tags: ["interaction"],
  args: { usage: reorderedUsage },
  play: async ({ canvasElement }) => {
    const names = Array.from(canvasElement.querySelectorAll("[aria-label]"))
      .map((element) => element.getAttribute("aria-label"))
      .filter((label) => label && /^(JPEG|PNG|WebP|HEIC \/ HEIF) /.test(label))
      .map((label) => label?.split(" ")[0])
    await expect(names).toEqual(["HEIC", "PNG", "WebP", "JPEG"])
  },
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
  tags: ["visual", "vrt"],
  args: { displayMode: "percent" },
}
