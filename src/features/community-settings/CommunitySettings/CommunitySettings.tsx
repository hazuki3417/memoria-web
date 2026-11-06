"use client"

import { useState, type ReactNode } from "react"
import type { CommunityMember } from "../members/CommunityMembersContent"
import { CommunitySettingsContent } from "./CommunitySettingsContent"
import { useCommunityNameSettings } from "../general/useCommunityNameSettings"
import { useCommunityInvitation } from "../general/useCommunityInvitation"
import type { CommunitySettingsSection } from "./communitySettingsSections"
import { CommunitySettingsLayout } from "./CommunitySettingsLayout"

export type { CommunitySettingsSection } from "./communitySettingsSections"
type Role = "admin" | "member"

export function CommunitySettings({
  role = "admin",
  communityId = "photo-club",
  section = "general",
  onNavigate,
  communityName,
  onSaveName,
  onInspectName,
  members,
  onChangeMemberRole,
  onRemoveMember,
  onLeaveCommunity,
  onLeaveSuccess,
  usageContent,
  preferencesContent,
  contentOverride,
  communityAccentColor,
}: {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  onNavigate?: (href: string) => void
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
  onInspectName?: () => Promise<string>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  fileSizeUnit?: "DECIMAL" | "BINARY"
  usageContent?: ReactNode
  preferencesContent?: ReactNode
  contentOverride?: ReactNode
  communityAccentColor?: string
}) {
  const [previewSection, setPreviewSection] =
    useState<CommunitySettingsSection>(section)
  const currentSection = onNavigate ? section : previewSection
  const isAdmin = role === "admin"
  const [accent, setAccent] = useState("#7950f2")
  const name = useCommunityNameSettings({ communityName, onSaveName, onInspectName })
  const invitation = useCommunityInvitation(communityId)

  return (
    <CommunitySettingsLayout
      communityId={communityId}
      section={currentSection}
      accentColor={communityAccentColor}
      onSectionChange={(next, href) => {
        if (onNavigate) onNavigate(href)
        else setPreviewSection(next)
      }}
    >
      {contentOverride ?? (
        <CommunitySettingsContent
          section={currentSection}
          communityId={communityId}
          isAdmin={isAdmin}
          name={name}
          invitation={invitation}
          members={members}
          onChangeMemberRole={onChangeMemberRole}
          onRemoveMember={onRemoveMember}
          onLeaveCommunity={onLeaveCommunity}
          onLeaveSuccess={onLeaveSuccess}
          preferencesContent={preferencesContent}
          usageContent={usageContent}
          accent={accent}
          setAccent={setAccent}
        />
      )}
    </CommunitySettingsLayout>
  )
}
