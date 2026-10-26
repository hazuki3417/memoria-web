"use client"

import { useRouter } from "next/navigation"
import {
  AccountDeletionFlow,
  type ReviewState,
  type CommunityScenario,
  type RetryOutcome,
} from "./AccountDeletionFlow"
import type { MockScenario } from "./accountDeletionGateway"

export function AccountDeletionImpact({
  reviewState = "default",
  communityScenario = "mixed-memberships",
  retryOutcome = "success",
  mockScenario,
}: {
  reviewState?: ReviewState
  communityScenario?: CommunityScenario
  retryOutcome?: RetryOutcome
  mockScenario?: MockScenario
}) {
  const router = useRouter()
  return (
    <AccountDeletionFlow
      reviewState={reviewState}
      communityScenario={communityScenario}
      retryOutcome={retryOutcome}
      mockScenario={mockScenario}
      onNavigateBack={() => router.push("/settings/account")}
    />
  )
}
