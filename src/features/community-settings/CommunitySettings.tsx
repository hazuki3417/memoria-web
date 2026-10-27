"use client"

import { useState, type ReactNode } from "react"
import {
  CommunityMembersContent,
  type CommunityMember,
} from "./CommunityMembersContent"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconSettings,
  IconUsers,
  IconChartBar,
  IconAdjustments,
} from "@tabler/icons-react"
import {
  SettingsSectionLayout,
  SettingsSectionNavigation,
} from "@/components/SettingsSectionLayout"
import { CommunityGeneralContent } from "./CommunityGeneralContent"
import { CommunityPreferencesContent } from "./CommunityPreferencesContent"
import { useCommunityGeneralSettings } from "./useCommunityGeneralSettings"

export type CommunitySettingsSection =
  | "general"
  | "members"
  | "usage"
  | "preferences"
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
  const general = useCommunityGeneralSettings({
    communityId,
    communityName,
    onSaveName,
  })

  const sections = [
    {
      id: "general",
      label: "一般",
      icon: IconAdjustments,
      href: `/communities/${encodeURIComponent(communityId)}/settings`,
    },
    {
      id: "members",
      label: "メンバー",
      icon: IconUsers,
      href: `/communities/${encodeURIComponent(communityId)}/members`,
    },
    {
      id: "preferences",
      label: "環境設定",
      icon: IconSettings,
      href: `/communities/${encodeURIComponent(communityId)}/preferences`,
    },
    {
      id: "usage",
      label: "利用状況",
      icon: IconChartBar,
      href: `/communities/${encodeURIComponent(communityId)}/usage`,
    },
  ]

  const generalContent = (
    <CommunityGeneralContent
      {...general}
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
      wrapCompactContent={false}
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
            if (target && target.id !== currentSection) navigate(target)
          }}
        />
      }
    >
      {content}
    </SettingsSectionLayout>
  )
}
