"use client"

import { useState } from "react"
import { CommunitySettingsLayout } from "../CommunitySettingsLayout"
import { SettingsSectionHost } from "@/ui/SettingsSectionHost"
import type { ReactNode } from "react"
import { CommunityGeneralView } from "../general/CommunityGeneralView"
import { CommunityMembersView } from "../members/CommunityMembersView"
import type { CommunityMember } from "../members"
import type { CommunityInvitationSectionProps } from "../general/CommunityInvitationSection"
import { CommunityPreferencesView } from "../preferences"
import type { CommunitySettingsSection } from "../communitySettingsSections"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import type { SaveCommunityName } from "../general/CommunityNameSection/communityNameSaveOutcome"
import { useCommunityStoryInvitation } from "./useCommunityStoryInvitation"


type Role = "admin" | "member"
type InvitationModel = Omit<CommunityInvitationSectionProps, "isAdmin" | "available">

export type CommunitySettingsStoryProps = {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  communityName?: string
  onSaveName?: SaveCommunityName
  onInspectName?: () => Promise<string>
  members?: CommunityMember[]
  onChangeMemberRole?: (userId: string, role: Role) => Promise<boolean>
  onRemoveMember?: (userId: string) => Promise<boolean>
  onLeaveCommunity?: () => Promise<void>
  onLeaveSuccess?: () => void
  usageContent?: ReactNode
  preferencesContent?: ReactNode
  invitationMode?: "preview" | "unavailable"
  invitation?: InvitationModel
  communityAccentColor?: string
  loadState?: PageStatus
  usageState?: PageStatus
  onSectionChange: (section: CommunitySettingsSection) => void
}

/**
 * Storybook-only adapter: keeps section changes inside Canvas.
 * Production route navigation is supplied independently by CommunitySettingsRoute.
 */
export const CommunitySettingsStoryNavigation = ({
  section = "general",
  onSectionChange: _onSectionChange,
  preferencesContent,
  invitationMode = "preview",
  invitation: suppliedInvitation,
  ...props
}: CommunitySettingsStoryProps) => {
  const [currentSection, setCurrentSection] =
    useState<CommunitySettingsSection>(section)
  const [accent, setAccent] = useState("#7950f2")
  const simulatedInvitation = useCommunityStoryInvitation(props.communityId ?? "photo-club", invitationMode === "preview")

  const communityId = props.communityId ?? "photo-club"
  const invitation = suppliedInvitation ?? simulatedInvitation
  const isAdmin = (props.role ?? "admin") === "admin"
  let content: ReactNode
  switch (currentSection) {
    case "general":
      content = (
        <CommunityGeneralView
          name={{
            communityName: props.communityName,
            onSaveName: props.onSaveName,
            onInspectName: props.onInspectName,
          }}
          invitation={invitation}
          invitationAvailable={invitationMode === "preview"}
          communityId={communityId}
          isAdmin={isAdmin}
        />
      )
      break
    case "members":
      content = (
        <CommunityMembersView
          members={props.members}
          onChangeRole={props.onChangeMemberRole}
          onRemoveMember={props.onRemoveMember}
          onLeave={props.onLeaveCommunity}
          onLeaveSuccess={props.onLeaveSuccess}
        />
      )
      break
    case "usage":
      content = props.usageContent
      break
    case "preferences":
      content = preferencesContent ?? <CommunityPreferencesView accent={accent} setAccent={setAccent} />
      break
  }

  return (
    <CommunitySettingsLayout
      communityId={communityId}
      section={currentSection}
      accentColor={props.communityAccentColor}
      onSectionChange={(next) => setCurrentSection(next)}
    >
        <SettingsSectionHost
          label={currentSection === "usage" && props.usageState !== undefined
            ? "利用状況を読み込み中"
            : "Community設定を読み込み中"}
        >
          {(render) => {
            const state = currentSection === "usage"
              ? props.usageState ?? props.loadState ?? "ready"
              : props.loadState ?? "ready"
            return render(state === "ready" ? { status: "ready", content } : { status: state })
          }}
        </SettingsSectionHost>
    </CommunitySettingsLayout>
  )
}
