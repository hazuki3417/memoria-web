import { useState } from "react"
import type { ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { UsageFormatBreakdownSection } from "./UsageFormatBreakdownSection"
import type { UsageSort, UsageSortKey } from "./sortUsageFormats"
import { sampleUsage, zeroUsage } from "./usageStoryFixtures"

function SortableBreakdownStory(
  props: Omit<ComponentProps<typeof UsageFormatBreakdownSection>, "sort" | "onSort">,
) {
  const [sort, setSort] = useState<UsageSort>(null)
  const toggleSort = (key: UsageSortKey) => {
    setSort((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }
  return <UsageFormatBreakdownSection {...props} sort={sort} onSort={toggleSort} />
}

const meta = {
  title: "Features/Settings/Usage/Format Breakdown",
  component: UsageFormatBreakdownSection,
  args: {
    usage: sampleUsage,
    status: "ready",
    fileSizeUnit: "DECIMAL",
    sort: null,
    onSort: () => undefined,
  },
} satisfies Meta<typeof UsageFormatBreakdownSection>

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
  name: "Loading Table",
  tags: ["visual"],
  args: { status: "loading" },
}

export const Empty: Story = {
  name: "正常な0件",
  tags: ["visual"],
  args: { usage: zeroUsage },
}

export const Binary: Story = {
  name: "Binary単位",
  tags: ["visual"],
  args: { fileSizeUnit: "BINARY" },
}

export const SortInteraction: Story = {
  name: "Interaction · byte数に基づくソート",
  tags: ["interaction"],
  render: (args) => (
    <SortableBreakdownStory
      usage={args.usage}
      status={args.status}
      fileSizeUnit={args.fileSizeUnit}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await userEvent.click(canvas.getByRole("button", { name: "使用量で並べ替え" }))
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("HEIC / HEIF")
    await expect(within(table).getByRole("columnheader", { name: /使用量/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    )
    await userEvent.click(canvas.getByRole("button", { name: "使用量で並べ替え" }))
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await expect(within(table).getByRole("columnheader", { name: /使用量/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    )
  },
}

export const LoadingContract: Story = {
  name: "Interaction · Loading時の操作不可",
  tags: ["interaction"],
  args: { status: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { name: "使用量で並べ替え" })).toBeDisabled()
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(4)
    await expect(canvas.getAllByRole("row")).toHaveLength(5)
  },
}
