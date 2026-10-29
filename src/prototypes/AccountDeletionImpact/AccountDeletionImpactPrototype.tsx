"use client"

import { Box as ScrollPaddingBox, ScrollArea as PageScrollArea } from "@mantine/core"


import type { PropsWithChildren } from "react"
import { getApplicationNavigation } from "@/features/application-shell"
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
      <PageScrollArea type="hover" h="100%" w="100%" style={{ overscrollBehavior: "contain" }}><ScrollPaddingBox pt="lg">
      {children}
          </ScrollPaddingBox></PageScrollArea>
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
