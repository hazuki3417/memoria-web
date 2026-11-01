"use client"

import { ScopedDashboard } from "./ScopedDashboard"

// Remount the entire scoped query consumer when switching contexts. Apollo
// must not expose the previous Community's protected data while loading.
export function DashboardContainer({
  contextKind = "personal",
  communityId,
}: {
  contextKind?: "personal" | "community"
  communityId?: string
}) {
  return (
    <ScopedDashboard
      key={
        contextKind === "personal"
          ? "personal"
          : `community:${communityId ?? ""}`
      }
      contextKind={contextKind}
      communityId={communityId}
    />
  )
}
