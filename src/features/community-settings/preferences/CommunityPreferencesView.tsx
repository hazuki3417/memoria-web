"use client"

import type { ComponentProps } from "react"
import { Stack } from "@mantine/core"
import { CommunityAliasSection } from "./CommunityAliasSection"
import { CommunityPreferencesLayout } from "./CommunityPreferencesLayout"
import { useCommunityPreferencesForm } from "./useCommunityPreferencesForm"
import type { CommunityPreferencesSaveOperations } from "./communityPreferencesSaveOutcome"
import type { CommunityPreferencesAccentPreview } from "./useCommunityPreferencesAutoSave"

export type CommunityPreferencesViewProps = {
  accent: string
  operations: CommunityPreferencesSaveOperations
  preview: CommunityPreferencesAccentPreview
  alias?: ComponentProps<typeof CommunityAliasSection>
  sourceReady?: boolean
}

/** 本番のAccent AutoSaveとAliasを共有画面UIへ接続する。 */
export const CommunityPreferencesView = ({
  accent,
  operations,
  preview,
  alias,
  sourceReady = true,
}: CommunityPreferencesViewProps) => {
  const model = useCommunityPreferencesForm({
    accent,
    restoreOnAccentChange: false,
    preserveDraftOnAccentChange: false,
    operations,
    preview,
    sourceReady,
  })

  return (
    <Stack gap="sm">
      <CommunityPreferencesLayout
        model={model}
        aliasSection={alias ? <CommunityAliasSection {...alias} /> : undefined}
        isPreview={false}
      />
    </Stack>
  )
}
