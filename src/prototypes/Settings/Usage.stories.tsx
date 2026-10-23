import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings/Usage",
  component: SettingsPrototype,
  args: { initialSection: "usage" },
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof SettingsPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
}

export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Loading: Story = {
  name: "Loading",
  args: { initialUsageScenario: "loading" },
  tags: ["visual"],
}

export const LoadingCompact: Story = {
  name: "Loading（Compact）",
  args: { initialUsageScenario: "loading" },
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Error: Story = {
  name: "Error / Retry",
  args: { initialUsageScenario: "error" },
  tags: ["visual"],
}

export const ErrorCompact: Story = {
  name: "Error / Retry（Compact）",
  args: { initialUsageScenario: "error" },
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const ErrorNoRetry: Story = {
  name: "Error（再試行Actionなし）",
  args: { initialUsageScenario: "error-no-retry" },
}

export const Zero: Story = {
  name: "使用量0",
  args: { initialUsageScenario: "zero" },
  tags: ["visual"],
}

export const ZeroCompact: Story = {
  name: "使用量0（Compact）",
  args: { initialUsageScenario: "zero" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const LimitReached: Story = {
  name: "上限到達",
  args: { initialUsageScenario: "limit-reached" },
  tags: ["visual"],
}

export const LimitReachedCompact: Story = {
  name: "上限到達（Compact）",
  args: { initialUsageScenario: "limit-reached" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const RetryInteraction: Story = {
  name: "Errorから再試行",
  args: { initialUsageScenario: "error" },
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "利用状況を取得できませんでした",
    )
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(canvas.getByRole("status", { name: "利用状況を読み込んでいます" })).toBeVisible()
    await expect(await canvas.findByText("1.24 GB")).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "登録件数で並べ替え" })).toBeEnabled()
  },
}

export const RetryFailureInteraction: Story = {
  name: "Errorから再試行して再失敗",
  args: { initialUsageScenario: "retry-error" },
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "利用状況を取得できませんでした",
    )
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(canvas.getByRole("status", { name: "利用状況を読み込んでいます" })).toBeVisible()
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "利用状況を取得できませんでした",
    )
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeEnabled()
  },
}

/** Data is not available during initial loading; labels and the table structure remain. */
export const LoadingContract: Story = {
  name: "Interaction · 初回Loadingの表示契約",
  args: { initialUsageScenario: "loading" },
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("status", { name: "利用状況を読み込んでいます" })).toBeVisible()
    await expect(canvas.getByText("使用済み")).toBeVisible()
    await expect(canvas.getByText("空き容量")).toBeVisible()
    await expect(canvas.getByText("総容量")).toBeVisible()
    await expect(canvas.getByText("ファイル形式別内訳")).toBeVisible()
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(4)
    await expect(canvas.getByRole("button", { name: "登録件数で並べ替え" })).toBeDisabled()
    await expect(canvas.queryByText(/1\\.24 GB/)).not.toBeInTheDocument()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

/** Initial errors do not accidentally render stale fixture data. */
export const ErrorContract: Story = {
  name: "Interaction · 初回Errorの表示契約",
  args: { initialUsageScenario: "error" },
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("region", { name: "利用状況の取得エラー" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("利用状況を取得できませんでした")
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeEnabled()
    await expect(canvas.queryByText(/1\\.24 GB/)).not.toBeInTheDocument()
    await expect(canvas.queryByRole("status", { name: "利用状況を読み込んでいます" })).not.toBeInTheDocument()
  },
}

/** Some contexts cannot offer retry; the error remains understandable. */
export const ErrorWithoutRetryContract: Story = {
  name: "Interaction · 再試行ActionなしのError",
  args: { initialUsageScenario: "error-no-retry" },
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toHaveTextContent("利用状況を取得できませんでした")
    await expect(canvas.queryByRole("button", { name: "再試行" })).not.toBeInTheDocument()
  },
}

export const ZeroContract: Story = {
  name: "Interaction · 正常な0件とLoadingの区別",
  args: { initialUsageScenario: "zero" },
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("登録済みのオリジナルファイルはありません")).toBeVisible()
    await expect(canvas.getByText("0 GB")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "登録件数で並べ替え" })).toBeEnabled()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(canvas.queryByRole("status", { name: "利用状況を読み込んでいます" })).not.toBeInTheDocument()
  },
}

export const LimitReachedContract: Story = {
  name: "Interaction · 容量上限到達の表示",
  args: { initialUsageScenario: "limit-reached" },
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("5,000 件")).toBeVisible()
    await expect(canvas.getByText("0 GB")).toBeVisible()
    await expect(canvas.getByRole("progressbar", { name: /ストレージ使用率 100%/ })).toBeInTheDocument()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const SortInteraction: Story = {
  name: "Interaction · File format内訳の並べ替え",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await userEvent.click(canvas.getByRole("button", { name: "登録件数で並べ替え" }))
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("HEIC / HEIF")
    await expect(within(table).getByRole("columnheader", { name: /登録件数/ })).toHaveAttribute("aria-sort", "ascending")
    await userEvent.click(canvas.getByRole("button", { name: "登録件数で並べ替え" }))
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await expect(within(table).getByRole("columnheader", { name: /登録件数/ })).toHaveAttribute("aria-sort", "descending")
  },
}
