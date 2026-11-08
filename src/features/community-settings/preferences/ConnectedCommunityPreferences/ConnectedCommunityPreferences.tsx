"use client"

import { Stack } from "@mantine/core"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { CommunityPreferencesContent } from "../CommunityPreferencesContent"
import { CommunityAliasControl } from "../CommunityAliasControl"
import { useCommunityPreferencesConnection } from "./useCommunityPreferencesConnection"
import { CommunityAccentSaveFeedback } from "./CommunityAccentSaveFeedback"

export function ConnectedCommunityPreferences({
  communityId,
}: {
  communityId: string
}) {
  const { data, loading, snapshot, controller, inspectAlias, saveAlias, canResave } =
    useCommunityPreferencesConnection(communityId)

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
      <CommunityPreferencesContent
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
