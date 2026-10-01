import type { Meta, StoryObj } from "@storybook/react"
import { AccountDeletionImpactPrototype } from "./AccountDeletionImpactPrototype"

const meta = {
  title: "Design Prototypes/Account Deletion Impact",
  component: AccountDeletionImpactPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AccountDeletionImpactPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { reviewState: "default" } }
export const NoMedia: Story = { args: { reviewState: "empty" } }
export const LoadFailed: Story = { args: { reviewState: "failure" } }
export const Compact: Story = {
  args: { reviewState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CommunityResolutionRequired: Story = {
  args: {
    reviewState: "default",
    communityScenario: "requires-resolution",
  },
}
export const CommunityResolutionSkipped: Story = {
  args: { reviewState: "default", communityScenario: "no-resolution" },
}
export const RetryLoading: Story = {
  args: { reviewState: "retrying", retryOutcome: "success" },
}
export const RetrySucceeds: Story = {
  args: { reviewState: "failure", retryOutcome: "success" },
}
export const RetryFails: Story = {
  args: { reviewState: "failure", retryOutcome: "failure" },
}
