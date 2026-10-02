import type { Meta, StoryObj } from "@storybook/react"
import { AccountDeletionImpactPrototype } from "./AccountDeletionImpactPrototype"

const meta = {
  title: "Design Prototypes/Account Deletion",
  component: AccountDeletionImpactPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AccountDeletionImpactPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { reviewState: "default", communityScenario: "mixed-memberships" },
}
export const NoCommunities: Story = {
  args: { reviewState: "default", communityScenario: "no-communities" },
}
export const MemberOnly: Story = {
  args: { reviewState: "default", communityScenario: "member-only" },
}
export const AdministratorWithOthersOnly: Story = {
  args: { reviewState: "default", communityScenario: "administrator-with-others-only" },
}
export const WithdrawalMixed: Story = {
  args: { reviewState: "default", communityScenario: "withdrawal-mixed" },
}
export const LastAdministrator: Story = {
  args: { reviewState: "default", communityScenario: "last-administrator" },
}
export const LastAdministratorNoCandidate: Story = {
  args: { reviewState: "default", communityScenario: "last-administrator-no-candidate" },
}
export const MultipleLastAdministrators: Story = {
  args: { reviewState: "default", communityScenario: "multiple-last-administrators" },
}
export const NoMedia: Story = {
  args: { reviewState: "empty", communityScenario: "mixed-memberships" },
}
export const LoadFailed: Story = {
  args: { reviewState: "failure", communityScenario: "mixed-memberships" },
}
export const RetryLoading: Story = {
  args: { reviewState: "retrying", retryOutcome: "success", communityScenario: "mixed-memberships" },
}
export const RetrySucceeds: Story = {
  args: { reviewState: "failure", retryOutcome: "success", communityScenario: "mixed-memberships" },
}
export const RetryFails: Story = {
  args: { reviewState: "failure", retryOutcome: "failure", communityScenario: "mixed-memberships" },
}
export const Compact: Story = {
  args: { reviewState: "default", communityScenario: "mixed-memberships" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const WithdrawalMixedCompact: Story = {
  args: { reviewState: "default", communityScenario: "withdrawal-mixed" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
