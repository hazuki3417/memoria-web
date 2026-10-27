"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { CommunityNameSection, type CommunityNameSectionProps } from "./CommunityNameSection"
import { CommunityInvitationSection, type CommunityInvitationSectionProps } from "./CommunityInvitationSection"
import { CommunityDangerZone } from "./CommunityDangerZone"

export type CommunityGeneralContentProps = {
  isAdmin: boolean
  communityId: string
  name: Omit<CommunityNameSectionProps, "isAdmin">
  invitation: Omit<CommunityInvitationSectionProps, "isAdmin">
}

export function CommunityGeneralContent({
  isAdmin,
  communityId,
  name,
  invitation,
}: CommunityGeneralContentProps) {
  return (
    <Stack gap="xl">
      <PageHeader
        title="Community Settings"
        description="Communityの基本情報と管理"
      />
      <CommunityNameSection {...name} isAdmin={isAdmin} />
      <CommunityInvitationSection {...invitation} isAdmin={isAdmin} />
      {isAdmin && <CommunityDangerZone communityId={communityId} />}
    </Stack>
  )
}
