"use client"

import { CommunityNameView } from "./CommunityNameView"
import { useCommunityNameForm } from "./useCommunityNameForm"
import type { SaveCommunityName } from "./communityNameSaveOutcome"

export type CommunityNameSectionProps = {
  isAdmin: boolean
  communityName?: string
  onSaveName?: SaveCommunityName
  onInspectName?: () => Promise<string>
}

const localSave: SaveCommunityName = async (name) => ({ kind: "success", value: name })

/** Community名のAction・Form・Recoveryを接続し、Viewへ表示用契約を渡す。 */
export const CommunityNameSection = ({
  isAdmin,
  communityName = "家族のアルバム",
  onSaveName = localSave,
  onInspectName,
}: CommunityNameSectionProps) => {
  const form = useCommunityNameForm({
    initialName: communityName,
    onSave: onSaveName,
    onInspect: onInspectName,
  })
  return <CommunityNameView isAdmin={isAdmin} form={form} onInspectName={onInspectName} />
}
