"use client"

import { CommunityAliasSectionView } from "./CommunityAliasSectionView"
import { useCommunityAliasForm, type InspectCommunityAlias } from "./useCommunityAliasForm"
import type { SaveCommunityAlias } from "./communityAliasSaveOutcome"

export type CommunityAliasSectionProps = {
  savedAlias: string | null
  onSave?: SaveCommunityAlias
  onInspect?: InspectCommunityAlias
}

const localSave: SaveCommunityAlias = async (alias) => ({ kind: "success", value: alias })

/** Community別名のForm・Action・復旧を接続し、Viewへ委譲する。 */
export const CommunityAliasSection = ({
  savedAlias,
  onSave = localSave,
  onInspect,
}: CommunityAliasSectionProps) => {
  const model = useCommunityAliasForm({ savedAlias, onSave, onInspect })
  return <CommunityAliasSectionView model={model} onInspect={onInspect} />
}
