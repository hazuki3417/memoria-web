"use client"

import { useState, type ReactNode } from "react"
import {
  CommunityMembersContent,
  type CommunityMember,
} from "./CommunityMembersContent"
import { useMediaQuery } from "@mantine/hooks"
import {
  SettingsSectionLayout,
  SettingsSectionNavigation,
} from "@/components/SettingsSectionLayout"
import { CommunityGeneralContent } from "./CommunityGeneralContent"
import { CommunityPreferencesContent } from "./CommunityPreferencesContent"
import { useCommunityNameSettings } from "./useCommunityNameSettings"
import { useCommunityInvitation } from "./useCommunityInvitation"
import { getCommunitySettingsSections, type CommunitySettingsSection } from "./communitySettingsSections"

export type { CommunitySettingsSection } from "./communitySettingsSections"
type Role = "admin" | "member"

export function CommunitySettings({
  role = "admin",
  communityId = "photo-club",
  section = "general",
  onNavigate,
  communityName,
  onSaveName,
  members,
  onChangeMemberRole,
  onRemoveMember,
  onLeaveCommunity,
  onLeaveSuccess,
  fileSizeUnit = "DECIMAL",
  usageContent,
}: {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  onNavigate?: (href: string) => void
  communityName?: string
  onSaveName?: (name: string) => Promise<boolean>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  fileSizeUnit?: "DECIMAL" | "BINARY"
  usageContent?: ReactNode
}) {
  const [previewSection, setPreviewSection] =
    useState<CommunitySettingsSection>(section)
  const currentSection = onNavigate ? section : previewSection
  const navigate = (target: (typeof sections)[number]) => {
    if (onNavigate) onNavigate(target.href)
    else setPreviewSection(target.id as CommunitySettingsSection)
  }
  const compact = useMediaQuery("(max-width: 48em)")
  const isAdmin = role === "admin"
  const [accent, setAccent] = useState("#7950f2")
  const name = useCommunityNameSettings({ communityName, onSaveName })
  const invitation = useCommunityInvitation(communityId)

  const sections = getCommunitySettingsSections(communityId)

  const generalContent = (
    <CommunityGeneralContent
      name={name}
      invitation={invitation}
      communityId={communityId}
      isAdmin={isAdmin}
    />
  )

  const membersContent = (
    <CommunityMembersContent
      members={members}
      onChangeRole={onChangeMemberRole}
      onRemoveMember={onRemoveMember}
      onLeave={onLeaveCommunity}
      onLeaveSuccess={onLeaveSuccess}
    />
  )
  const preferencesContent = (
    <CommunityPreferencesContent accent={accent} setAccent={setAccent} />
  )
  const content =
    currentSection === "general"
      ? generalContent
      : currentSection === "members"
        ? membersContent
        : currentSection === "usage"
          ? usageContent
          : preferencesContent

  return (
    <SettingsSectionLayout
      compact={compact}
      navigation={
        <SettingsSectionNavigation
          section={currentSection}
          sections={sections}
          compact={compact}
          ariaLabel="Community設定画面"
          desktopAriaLabel="Community設定"
          accentColor="var(--mantine-color-violet-6)"
          onSectionChange={(value) => {
            const target = sections.find((item) => item.id === value)
            if (target) navigate(target)
          }}
        />
      }
    >
      {content}
    </SettingsSectionLayout>
  )
}
