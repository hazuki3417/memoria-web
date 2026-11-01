"use client"

import { AccountDeletionFlow, type ReviewState, type CommunityScenario, type RetryOutcome } from "@/features/account-deletion/AccountDeletionFlow"
import { PrototypeShell } from "./PrototypeShell"

export function AccountDeletionImpactPrototype({
  reviewState = "default",
  communityScenario = "mixed-memberships",
  retryOutcome = "success",
}: {
  reviewState?: ReviewState
  communityScenario?: CommunityScenario
  retryOutcome?: RetryOutcome
}) {
  return (
    <AccountDeletionFlow
      reviewState={reviewState}
      communityScenario={communityScenario}
      retryOutcome={retryOutcome}
      prototype
      onNavigateBack={() => undefined}
      shell={PrototypeShell}
    />
  )
}
