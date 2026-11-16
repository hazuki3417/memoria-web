"use client"

import { Stack } from "@mantine/core"
import { CommunityPreferencesView } from "./CommunityPreferencesView"
import { CommunityAliasSection } from "./CommunityAliasSection"
import { CommunityPreferencesSaveFeedback } from "./CommunityPreferencesSaveFeedback"
import { useCommunityPreferencesAutoSave } from "./useCommunityPreferencesAutoSave"
import type { useCommunityAliasSave } from "./CommunityAliasSection/useCommunityAliasSave"

/** Ready-only UI composition; its Accent Queue closes when this view unmounts. */
export const CommunityPreferencesSection = ({
  communityId,
  settings,
  alias,
}: {
  communityId: string
  settings: { accentColor: string; alias: string | null }
  alias: ReturnType<typeof useCommunityAliasSave>
}) => {
  const { snapshot, controller, canResave } =
    useCommunityPreferencesAutoSave(communityId, settings.accentColor)
  const failure = snapshot.failure
  const accent = snapshot.confirmed ?? settings.accentColor
  const lastDraft = snapshot.draft ?? accent

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
        onAccentDraftChange={(value) => controller.edit(value)}
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
