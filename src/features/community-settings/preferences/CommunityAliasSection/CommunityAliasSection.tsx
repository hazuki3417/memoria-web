"use client"

import { CommunityAliasSectionView } from "./CommunityAliasSectionView"
import { useCommunityAliasForm } from "./useCommunityAliasForm"
import type { SaveCommunityAlias } from "./communityAliasSaveOutcome"

export type CommunityAliasSectionProps = {
  savedAlias: string | null
  onSave?: SaveCommunityAlias
}

const localSave: SaveCommunityAlias = async (alias) => ({ kind: "success", value: alias })

/** Community別名のForm・Actionを接続し、Viewへ委譲する。 */
export const CommunityAliasSection = ({
  savedAlias,
  onSave = localSave,
}: CommunityAliasSectionProps) => {
  const model = useCommunityAliasForm({ savedAlias, onSave })
  return <CommunityAliasSectionView model={model} />
}
