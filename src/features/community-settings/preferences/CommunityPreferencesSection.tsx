"use client"

import { Stack } from "@mantine/core"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { CommunityPreferences } from "./CommunityPreferences"
import { CommunityAliasControl } from "./CommunityAliasControl"
import { CommunityAccentSaveFeedback } from "./ConnectedCommunityPreferences/CommunityAccentSaveFeedback"
import type { useCommunityPreferencesConnection } from "./ConnectedCommunityPreferences/useCommunityPreferencesConnection"
import type { useCommunityAliasConnection } from "./ConnectedCommunityPreferences/useCommunityAliasConnection"

/** Preferences固有の取得状態とForm・Feedback UIのCompositionを所有する。 */
export function CommunityPreferencesSection({
  communityId,
  model,
  alias,
}: {
  communityId: string
  model: ReturnType<typeof useCommunityPreferencesConnection>
  alias: ReturnType<typeof useCommunityAliasConnection>
}) {
  const { data, loading, snapshot, controller, canResave } = model

  if (!data?.community) {
    return (
      <PageStatusBoundary
        state={loading ? "loading" : "error"}
        label="Community環境設定を読み込み中"
      >
        {null}
      </PageStatusBoundary>
    )
  }

  const failure = snapshot.failure
  const accent = snapshot.confirmed ?? data.community.mySettings.accentColor
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
          <CommunityAliasControl
            savedAlias={data.community.mySettings.alias}
            onInspect={alias.inspectAlias}
            onSave={alias.saveAlias}
          />
        }
        setAccent={() => undefined}
      />
    </Stack>
  )
}
