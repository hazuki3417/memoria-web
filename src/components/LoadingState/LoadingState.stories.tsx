import type { Meta, StoryObj } from "@storybook/react"
import { LoadingState } from "./LoadingState"
const meta = { title: "Components/LoadingState", component: LoadingState, args: { title: "読み込んでいます", description: "しばらくお待ちください。" } } satisfies Meta<typeof LoadingState>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { tags: ["visual"] }
export const Inline: Story = { args: { variant: "inline" }, tags: ["visual"] }
export const WithoutDescription: Story = { args: { description: undefined }, tags: ["visual"] }
