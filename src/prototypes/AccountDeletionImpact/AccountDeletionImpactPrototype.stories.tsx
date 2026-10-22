import type { Meta, StoryObj } from "@storybook/react"
import { AccountDeletionImpactPrototype } from "./AccountDeletionImpactPrototype"

const meta = {
  title: "Design Prototypes/Account Deletion",
  component: AccountDeletionImpactPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof AccountDeletionImpactPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "mixed-memberships" },
}
export const NoCommunities: Story = {
  name: "No Communities",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "no-communities" },
}
export const MemberOnly: Story = {
  name: "Member Only",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "member-only" },
}
export const AdministratorWithOthersOnly: Story = {
  name: "Administrator With Others Only",
  tags: ["visual"],
  args: {
    reviewState: "default",
    communityScenario: "administrator-with-others-only",
  },
}
export const WithdrawalMixed: Story = {
  name: "Withdrawal Mixed",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "withdrawal-mixed" },
}
export const LastAdministrator: Story = {
  name: "Last Administrator",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "last-administrator" },
}
export const LastAdministratorNoCandidate: Story = {
  name: "Last Administrator No Candidate",
  tags: ["visual"],
  args: {
    reviewState: "default",
    communityScenario: "last-administrator-no-candidate",
  },
}
export const MultipleLastAdministrators: Story = {
  name: "Multiple Last Administrators",
  tags: ["visual"],
  args: {
    reviewState: "default",
    communityScenario: "multiple-last-administrators",
  },
}
export const NoMedia: Story = {
  name: "No Media",
  tags: ["visual"],
  args: { reviewState: "empty", communityScenario: "mixed-memberships" },
}
export const LoadFailed: Story = {
  name: "Load Failed",
  tags: ["visual"],
  args: { reviewState: "failure", communityScenario: "mixed-memberships" },
}
export const RetryLoading: Story = {
  name: "Retry Loading",
  tags: ["visual"],
  args: {
    reviewState: "retrying",
    retryOutcome: "success",
    communityScenario: "mixed-memberships",
  },
}
export const RetrySucceeds: Story = {
  name: "Retry Succeeds",
  tags: ["visual"],
  args: {
    reviewState: "failure",
    retryOutcome: "success",
    communityScenario: "mixed-memberships",
  },
}
export const RetryFails: Story = {
  name: "Retry Fails",
  tags: ["visual"],
  args: {
    reviewState: "failure",
    retryOutcome: "failure",
    communityScenario: "mixed-memberships",
  },
}
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "mixed-memberships" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const WithdrawalMixedCompact: Story = {
  name: "Withdrawal Mixed Compact",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "withdrawal-mixed" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
