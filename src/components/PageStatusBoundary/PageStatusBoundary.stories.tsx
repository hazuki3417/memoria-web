import { Box, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { PageStatusBoundary } from "./PageStatusBoundary"

const meta = {
  title: "Components/Feedback/Page Status Boundary",
  component: PageStatusBoundary,
  args: {
    state: "ready",
    label: "ページを読み込み中",
    children: <Text>ページコンテンツ</Text>,
    delayMs: 0,
  },
  decorators: [(Story) => <Box maw={760}><Story /></Box>],
} satisfies Meta<typeof PageStatusBoundary>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Visual · コンテンツ表示",
  tags: ["visual", "vrt"],
}
export const Loading: Story = {
  name: "Visual · 読み込み中",
  tags: ["visual"],
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("status", { name: "ページを読み込み中" })).toBeVisible()
  },
}
export const Error: Story = {
  name: "Visual · 取得失敗",
  tags: ["visual", "vrt"],
  args: { state: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toBeVisible()
    await expect(canvas.queryByRole("button", { name: "再試行" })).not.toBeInTheDocument()
  },
}
export const CustomMessage: Story = {
  name: "Visual · カスタムエラーメッセージ",
  tags: ["visual"],
  args: {
    state: "error",
    errorTitle: "メディアを読み込めませんでした",
    errorDescription: "通信状況を確認し、ページを再読み込みしてください。",
  },
}
