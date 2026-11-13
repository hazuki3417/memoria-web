"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { CommunityAccessBoundary } from "./CommunityAccessBoundary"

/** Next.js route navigation belongs to this production adapter, not the access gate. */
export function ConnectedCommunityAccessBoundary({
  communityId,
  children,
}: {
  communityId: string
  children: ReactNode
}) {
  const router = useRouter()
  return (
    <CommunityAccessBoundary
      communityId={communityId}
      onReturnToDashboard={() => router.push("/dashboard")}
      onLogin={() => router.push("/login")}
    >
      {children}
    </CommunityAccessBoundary>
  )
}
