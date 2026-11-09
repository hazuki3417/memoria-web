"use client"

import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import {
  CommunityNameSection,
  type CommunityNameSectionProps,
} from "./CommunityNameSection"
import {
  CommunityInvitationSection,
  type CommunityInvitationSectionProps,
} from "./CommunityInvitationSection"
import { CommunityDangerZone } from "./CommunityDangerZone"

export type CommunityGeneralProps = {
  isAdmin: boolean
  communityId: string
  name: Omit<CommunityNameSectionProps, "isAdmin">
  invitation: Omit<CommunityInvitationSectionProps, "isAdmin" | "available">
  invitationAvailable: boolean
}

export function CommunityGeneral({
  isAdmin,
  communityId,
  name,
  invitation,
  invitationAvailable,
}: CommunityGeneralProps) {
  return (
    <Stack gap="xl">
      <PageHeader
        title="Community Settings"
        description="Communityの基本情報と管理"
      />
      <CommunityNameSection {...name} isAdmin={isAdmin} />
      <CommunityInvitationSection
        {...invitation}
        isAdmin={isAdmin}
        available={invitationAvailable}
      />
      {isAdmin && <CommunityDangerZone communityId={communityId} />}
    </Stack>
  )
}
