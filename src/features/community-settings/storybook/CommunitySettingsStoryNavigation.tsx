"use client"

import { useState } from "react"
import { CommunitySettingsView } from "../CommunitySettingsView"
import { SettingsSectionHost } from "@/ui/SettingsSectionHost"
import type { ReactNode } from "react"
import { CommunityGeneral } from "../general/CommunityGeneral"
import { CommunityMembers } from "../members"
import type { CommunityMember } from "../members"
import type { CommunityInvitationSectionProps } from "../general/CommunityInvitationSection"
import { CommunityPreferences } from "../preferences/CommunityPreferences"
import type { CommunitySettingsSection } from "../communitySettingsSections"
import type { PageStatus } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useCommunityStoryInvitation } from "./useCommunityStoryInvitation"


type Role = "admin" | "member"
type InvitationModel = Omit<CommunityInvitationSectionProps, "isAdmin" | "available">

export type CommunitySettingsStoryProps = {
  role?: Role
  communityId?: string
  section?: CommunitySettingsSection
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
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
export function CommunitySettingsStoryNavigation({
  section = "general",
  onSectionChange: _onSectionChange,
  preferencesContent,
  invitationMode = "preview",
  invitation: suppliedInvitation,
  ...props
}: CommunitySettingsStoryProps) {
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
        <CommunityGeneral
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
        <CommunityMembers
          members={props.members}
          onChangeRole={props.onChangeMemberRole}
          onRemoveMember={props.onRemoveMember}
          onLeave={props.onLeaveCommunity}
          onLeaveSuccess={props.onLeaveSuccess}
        />
      )
      break
    case "usage":
      content = <>{props.usageContent}</>
      break
    case "preferences":
      content = <>{preferencesContent ?? <CommunityPreferences accent={accent} setAccent={setAccent} />}</>
      break
  }

  return (
    <CommunitySettingsView
      communityId={communityId}
      section={currentSection}
      content={
        <SettingsSectionHost
          label={currentSection === "usage" ? "利用状況を読み込み中" : "Community設定を読み込み中"}
        >
          {(render) => {
            const state = currentSection === "usage"
              ? props.usageState ?? props.loadState ?? "ready"
              : props.loadState ?? "ready"
            return render(state === "ready" ? { status: "ready", content } : { status: state })
          }}
        </SettingsSectionHost>
      }
      communityAccentColor={props.communityAccentColor}
      onSectionChange={(next) => setCurrentSection(next)}
    />
  )
}
