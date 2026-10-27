import { StandardPageScroll } from "@/components/StandardPageScroll/StandardPageScroll"
"use client"

import type { PropsWithChildren } from "react"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import {
  AccountDeletionFlow,
  type ReviewState,
  type CommunityScenario,
  type RetryOutcome,
} from "@/features/account-deletion/AccountDeletionFlow"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

const personalContext = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}

function PrototypeShell({ children }: PropsWithChildren) {
  return (
    <PrototypeApplicationShell
      currentContext={personalContext}
      contexts={[personalContext]}
      navigationItems={getApplicationNavigation({ contextKind: "personal" })}
    >
      <StandardPageScroll>
      {children}
          </StandardPageScroll>
</PrototypeApplicationShell>
  )
}

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
