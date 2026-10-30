import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { GroupMediaPageFeedback } from "./GroupMediaPageFeedback"
const meta = {
  title: "Features/Group Browser/GroupMediaPageFeedback",
  component: GroupMediaPageFeedback,
  args: { state: "idle" as const, onRetry: fn() },
} satisfies Meta<typeof GroupMediaPageFeedback>
export default meta
type Story = StoryObj<typeof meta>
export const Idle: Story = {}
export const Loading: Story = { args: { state: "loading" }, tags: ["visual"] }
export const Error: Story = { args: { state: "error" }, tags: ["visual"] }
