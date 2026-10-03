import type { Meta, StoryObj } from "@storybook/react"
import { FeedbackAlert } from "./Feedback"

const meta = {
  title: "Components/Feedback Alert",
  component: FeedbackAlert,
  args: {
    kind: "info",
    title: "お知らせ",
    children: "操作に必要な情報をここに表示します。",
  },
} satisfies Meta<typeof FeedbackAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {}

export const Success: Story = {
  args: {
    kind: "success",
    title: "保存しました",
    children: "変更内容を保存しました。",
  },
}

export const Warning: Story = {
  args: {
    kind: "warning",
    title: "確認してください",
    children: "操作を続ける前に内容を確認してください。",
  },
}

export const Error: Story = {
  args: {
    kind: "error",
    title: "処理を続けられません",
    children: "現在の状態ではこの操作を続けられません。",
  },
}
