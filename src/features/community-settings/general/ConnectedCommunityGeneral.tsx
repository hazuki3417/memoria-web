"use client"

import { useCommunitySettingsGeneralQuery } from "@/infrastructure/graphql/generated"
import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { CommunityGeneral } from "./CommunityGeneral"
import { useCommunityNameSave } from "./CommunityNameSection/useCommunityNameSave"
import { useCommunityNameInspection } from "./CommunityNameSection/useCommunityNameInspection"
import type { CommunityInvitationSectionProps } from "./CommunityInvitationSection"
import { useCommunitySettingsRefreshError } from "../useCommunitySettingsRefreshError"

// Production Invitation API is not connected. Preview actions remain unavailable.
const unavailableInvitation: Omit<CommunityInvitationSectionProps, "isAdmin" | "available"> = {
  active: false,
  invitation: "none",
  invitationUrl: "",
  expiresAt: "",
  busy: false,
  issue: () => undefined,
  copyInvitation: async () => undefined,
  confirm: null,
  setConfirm: () => undefined,
  changeInvitation: () => undefined,
}

/** Fetch only the Community name and fields required to determine admin. */
export function ConnectedCommunityGeneral({
  communityId,
  render,
}: {
  communityId: string
  render: SettingsSectionRender
}) {
  const query = useCommunitySettingsGeneralQuery({
    variables: { communityId },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  })
  const { onSaveName } = useCommunityNameSave(communityId)
  const onInspectName = useCommunityNameInspection(communityId)
  const name = query.data?.community?.name
  const members = query.data?.communityMembers
  const selfId = query.data?.me?.id
  const ready = name !== undefined && members !== undefined && selfId !== undefined

  useCommunitySettingsRefreshError(Boolean(ready && query.error))
  if (!ready) {
    return render(
      query.loading
        ? { status: "loading" }
        : {
            status: "error",
            retry: () => { void query.refetch().catch(() => undefined) },
          },
    )
  }

  return render({
    status: "ready",
    content: (
      <CommunityGeneral
        name={{ communityName: name, onSaveName, onInspectName }}
        invitation={unavailableInvitation}
        invitationAvailable={false}
        communityId={communityId}
        isAdmin={members.some((member) => member.userId === selfId && member.role === "admin")}
      />
    ),
  })
}
