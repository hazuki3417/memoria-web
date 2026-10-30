import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { GroupRelationCandidateFeedback } from "./GroupRelationCandidateFeedback"
const meta = {
  title: "Features/Group Browser/GroupRelationCandidateFeedback",
  component: GroupRelationCandidateFeedback,
  args: {
    canManage: true,
    hasSelection: true,
    state: "ready" as const,
    onRetry: fn(async () => undefined),
  },
} satisfies Meta<typeof GroupRelationCandidateFeedback>
export default meta
type Story = StoryObj<typeof meta>
export const Ready: Story = {}
export const Loading: Story = { args: { state: "loading" }, tags: ["visual"] }
export const Error: Story = { args: { state: "error" }, tags: ["visual"] }
export const ReadOnly: Story = {
  args: { state: "error", canManage: false },
  tags: ["visual"],
}
