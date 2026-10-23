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

export const Zero: Story = {
  name: "使用量0",
  args: { initialUsageScenario: "zero" },
  tags: ["visual"],
}

export const LimitReached: Story = {
  name: "上限到達",
  args: { initialUsageScenario: "limit-reached" },
  tags: ["visual"],
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
    await expect(await canvas.findByText(/1\.24 GB/)).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
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
