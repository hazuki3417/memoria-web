"use client"

import { useParams } from "next/navigation"
import { CommunityDeletionConfirmation } from "@/features/community-settings/CommunityDeletionConfirmation"

// Prototype data only. Replace with authorized Community details and deletion API.
export default function CommunityDeletePage() {
  const params = useParams<{ communityId: string }>()
  return (
    <CommunityDeletionConfirmation
      communityId={params.communityId}
      communityName="家族のアルバム"
      managedMediaCount={12}
      isAdministrator
      onDelete={async () => { await Promise.resolve() }}
    />
  )
}
