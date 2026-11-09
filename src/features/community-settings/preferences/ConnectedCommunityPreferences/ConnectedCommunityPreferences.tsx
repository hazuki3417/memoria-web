"use client"

import { Stack } from "@mantine/core"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { CommunityPreferences } from "../CommunityPreferences"
import { CommunityAliasControl } from "../CommunityAliasControl"
import { useCommunityPreferencesConnection } from "./useCommunityPreferencesConnection"
import { useCommunityAliasConnection } from "./useCommunityAliasConnection"
import { CommunityAccentSaveFeedback } from "./CommunityAccentSaveFeedback"

export function ConnectedCommunityPreferences({
  communityId,
}: {
  communityId: string
}) {
  const { data, loading, snapshot, controller, canResave } =
    useCommunityPreferencesConnection(communityId)
  const { inspectAlias, saveAlias } = useCommunityAliasConnection(communityId)

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
            onInspect={inspectAlias}
            onSave={saveAlias}
          />
        }
        setAccent={() => undefined}
      />
    </Stack>
  )
}
