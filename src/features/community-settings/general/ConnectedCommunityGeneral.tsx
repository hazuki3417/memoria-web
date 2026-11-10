"use client"

import { CommunityGeneral } from "./CommunityGeneral"
import { useCommunityNameAction } from "./useCommunityNameAction"
import { useCommunityNameInspection } from "./useCommunityNameInspection"
import type { CommunityInvitationSectionProps } from "./CommunityInvitationSection"

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

type ConnectedCommunityGeneralProps = {
  communityId: string
  name: string | null
  isAdmin: boolean
}

/** Generalだけが所有するCommunity名の保存・結果照会をSection UIへ接続する。 */
export function ConnectedCommunityGeneral({
  communityId,
  name,
  isAdmin,
}: ConnectedCommunityGeneralProps) {
  const { onSaveName } = useCommunityNameAction(communityId)
  const onInspectName = useCommunityNameInspection(communityId)

  return (
    <CommunityGeneral
      name={{ communityName: name ?? undefined, onSaveName, onInspectName }}
      invitation={unavailableInvitation}
      invitationAvailable={false}
      communityId={communityId}
      isAdmin={isAdmin}
    />
  )
}
