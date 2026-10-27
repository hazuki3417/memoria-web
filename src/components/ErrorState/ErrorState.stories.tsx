import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { ErrorState } from "./ErrorState"
const meta = { title: "Components/ErrorState", component: ErrorState, args: { title: "読み込めませんでした", description: "通信状態を確認してください。", onRetry: fn() } } satisfies Meta<typeof ErrorState>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { tags: ["visual"] }
export const Inline: Story = { args: { variant: "inline" }, tags: ["visual"] }
export const WithoutRetry: Story = { args: { onRetry: undefined }, tags: ["visual"] }
