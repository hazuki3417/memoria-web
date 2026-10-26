import { useState } from "react"
import type { ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { UsageFormatBreakdownSection } from "./UsageFormatBreakdownSection"
import {
  defaultUsageSort,
  nextUsageSort,
  type UsageSort,
  type UsageSortKey,
} from "./sortUsageFormats"
import { sampleUsage, zeroUsage } from "./usageStoryFixtures"

function SortableBreakdownStory(
  props: Omit<
    ComponentProps<typeof UsageFormatBreakdownSection>,
    "sort" | "onSort"
  >,
) {
  const [sort, setSort] = useState<UsageSort>(defaultUsageSort)
  const toggleSort = (key: UsageSortKey) => {
    setSort((current) => nextUsageSort(current, key))
  }
  return (
    <UsageFormatBreakdownSection {...props} sort={sort} onSort={toggleSort} />
  )
}

const meta = {
  title: "Features/Settings/Usage/Format Breakdown",
  component: UsageFormatBreakdownSection,
  args: {
    usage: sampleUsage,
    status: "ready",
    fileSizeUnit: "DECIMAL",
    displayMode: "size",
    sort: defaultUsageSort,
    onSort: () => undefined,
  },
} satisfies Meta<typeof UsageFormatBreakdownSection>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Visual · Ready（Decimal）",
  tags: ["visual"],
}

export const SortAscending: Story = {
  name: "Visual · 使用量・昇順",
  tags: ["visual"],
  args: { sort: { key: "size", direction: "asc" } },
}

export const SortDescending: Story = {
  name: "Visual · 使用量・降順",
  tags: ["visual"],
  args: { sort: { key: "size", direction: "desc" } },
}

export const ReadyCompact: Story = {
  name: "Visual · Ready（Compact）",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Loading: Story = {
  name: "Visual · Loading Table",
  tags: ["visual"],
  args: { status: "loading" },
}

export const Empty: Story = {
  name: "Visual · 正常な0件",
  tags: ["visual"],
  args: { usage: zeroUsage },
}

export const Binary: Story = {
  name: "Visual · Binary単位",
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
      displayMode={args.displayMode}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await expect(canvas.getByTestId("usage-sort-icon-desc")).toBeInTheDocument()
    await expect(
      within(table).getByRole("columnheader", { name: /使用量/ }),
    ).toHaveAttribute("aria-sort", "descending")
    await userEvent.click(
      canvas.getByRole("button", { name: "使用量で並べ替え" }),
    )
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await expect(
      within(table).getByRole("columnheader", { name: /使用量/ }),
    ).toHaveAttribute("aria-sort", "none")
    await expect(canvas.getAllByTestId("usage-sort-icon-none")).toHaveLength(3)
    await userEvent.click(
      canvas.getByRole("button", { name: "使用量で並べ替え" }),
    )
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent(
      "HEIC / HEIF",
    )
    await expect(
      within(table).getByRole("columnheader", { name: /使用量/ }),
    ).toHaveAttribute("aria-sort", "ascending")
    await expect(canvas.getByTestId("usage-sort-icon-asc")).toBeInTheDocument()
    await userEvent.click(
      canvas.getByRole("button", { name: "使用量で並べ替え" }),
    )
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await expect(
      within(table).getByRole("columnheader", { name: /使用量/ }),
    ).toHaveAttribute("aria-sort", "descending")
  },
}

export const LoadingContract: Story = {
  name: "Interaction · Loading時の操作不可",
  tags: ["interaction"],
  args: { status: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("button", { name: "使用量で並べ替え" }),
    ).toBeDisabled()
    await expect(
      within(canvas.getAllByRole("row")[0]).getAllByRole("columnheader"),
    ).toHaveLength(3)
    await expect(canvas.getAllByRole("row")).toHaveLength(6)
  },
}

export const Percent: Story = {
  name: "Visual · 割合表示",
  tags: ["visual", "vrt"],
  args: { displayMode: "percent" },
}
