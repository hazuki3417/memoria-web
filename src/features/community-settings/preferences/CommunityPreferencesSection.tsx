"use client"

import { Stack } from "@mantine/core"
import { CommunityPreferencesView } from "./CommunityPreferencesView"
import { CommunityAliasSection } from "./CommunityAliasSection"
import { CommunityPreferencesSaveFeedback } from "./CommunityPreferencesSaveFeedback"
import { useCommunityPreferencesAutoSave } from "./useCommunityPreferencesAutoSave"
import type { CommunityPreferencesValues } from "./communityPreferences"
import type { useCommunityAliasSave } from "./CommunityAliasSection/useCommunityAliasSave"

/** Ready状態のPreferencesを保存Lifecycleへ接続する。Aliasの明示保存は独立させる。 */
export const CommunityPreferencesSection = ({
  communityId,
  settings,
  alias,
}: {
  communityId: string
  settings: CommunityPreferencesValues & { alias: string | null }
  alias: ReturnType<typeof useCommunityAliasSave>
}) => {
  const { snapshot, controller, canResave } =
    useCommunityPreferencesAutoSave(communityId, settings)
  const failure = snapshot.failure
  const accent = snapshot.confirmed?.accentColor ?? settings.accentColor
  const lastDraft = snapshot.draft?.accentColor ?? accent

  return (
    <Stack gap="sm">
      <CommunityPreferencesView
        key={communityId}
        accent={accent}
        initialDraft={lastDraft}
        isPreview={false}
        preserveDraftOnAccentChange={failure !== null}
        saveStatus={failure ? "attention" : snapshot.status}
        accentError={snapshot.validation?.fieldErrors.accentColor}
        onAccentDraftChange={(value) => controller.edit({ accentColor: value })}
        saveFeedback={
          failure ? (
            <CommunityPreferencesSaveFeedback
              snapshot={snapshot}
              controller={controller}
              canResave={canResave}
            />
          ) : undefined
        }
        aliasSection={
          <CommunityAliasSection
            savedAlias={settings.alias}
            onInspect={alias.inspectAlias}
            onSave={alias.saveAlias}
          />
        }
        setAccent={() => undefined}
      />
    </Stack>
  )
}
