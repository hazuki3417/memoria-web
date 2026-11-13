"use client"

import { Stack } from "@mantine/core"
import { CommunityPreferences } from "./CommunityPreferences"
import { CommunityAliasSection } from "./CommunityAliasSection"
import { CommunityAccentSaveFeedback } from "./ConnectedCommunityPreferences/CommunityAccentSaveFeedback"
import type { useCommunityPreferencesConnection } from "./ConnectedCommunityPreferences/useCommunityPreferencesConnection"
import type { useCommunityAliasConnection } from "./ConnectedCommunityPreferences/useCommunityAliasConnection"

type Connection = ReturnType<typeof useCommunityPreferencesConnection>

/** Ready-only UI composition; status is exclusively the shared Host's concern. */
export function CommunityPreferencesSection({
  communityId,
  settings,
  snapshot,
  controller,
  canResave,
  alias,
}: {
  communityId: string
  settings: { accentColor: string; alias: string | null }
  snapshot: Connection["snapshot"]
  controller: Connection["controller"]
  canResave: boolean
  alias: ReturnType<typeof useCommunityAliasConnection>
}) {
  const failure = snapshot.failure
  const accent = snapshot.confirmed ?? settings.accentColor
  const lastDraft = snapshot.draft ?? accent

  return (
    <Stack gap="sm">
      <CommunityPreferences
        key={communityId}
        accent={accent}
        initialDraft={lastDraft}
        isPreview={false}
        preserveDraftOnAccentChange={failure !== null}
        saveStatus={failure ? "attention" : snapshot.status}
        accentError={snapshot.validation?.fieldErrors.accentColor}
        onAccentDraftChange={(value) => controller.edit(communityId, value)}
        saveFeedback={
          failure ? (
            <CommunityAccentSaveFeedback
              communityId={communityId}
              snapshot={snapshot}
              controller={controller}
              canResave={canResave}
            />
          ) : undefined
        }
        aliasControl={
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
