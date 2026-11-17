"use client"

import { CommunityNameSectionView } from "./CommunityNameSectionView"
import { useCommunityNameForm } from "./useCommunityNameForm"
import type { SaveCommunityName } from "./communityNameSaveOutcome"

export type CommunityNameSectionProps = {
  isAdmin: boolean
  communityName?: string
  onSaveName?: SaveCommunityName
}

const localSave: SaveCommunityName = async (name) => ({ kind: "success", value: name })

/** Community名のAction・Formを接続し、Viewへ表示用契約を渡す。 */
export const CommunityNameSection = ({
  isAdmin,
  communityName = "家族のアルバム",
  onSaveName = localSave,
}: CommunityNameSectionProps) => {
  const form = useCommunityNameForm({
    initialName: communityName,
    onSave: onSaveName,
  })
  return <CommunityNameSectionView isAdmin={isAdmin} form={form} />
}
