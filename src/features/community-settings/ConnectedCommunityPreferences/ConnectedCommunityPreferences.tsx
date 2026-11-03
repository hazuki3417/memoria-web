"use client"

import { useEffect } from "react"
import { Button, Stack, Text } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import { useApolloClient } from "@apollo/client"
import {
  useCommunityAccentPreview,
  useCommunityAccentSave,
} from "@/features/application-shell/CommunityAccentPreviewContext"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "@/features/settings/useSettingsRefreshError"
import { CommunityPreferencesContent } from "../CommunityPreferencesContent"
import { CommunityAliasControl } from "../CommunityAliasControl"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"
import { SettingsInputValidationError, requireSettingsMutationOutcome } from "@/features/settings/graphqlSettingsResult"
import {
  CommunityMySettingsDocument,
  UpdateCommunitySettingsDocument,
  type OperationUpdateCommunitySettingsMutation,
  type OperationUpdateCommunitySettingsMutationVariables,
  useCommunityMySettingsQuery,
  useUpdateCommunitySettingsMutation,
} from "@/infrastructure/graphql/generated"

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

export function ConnectedCommunityPreferences({
  communityId,
}: {
  communityId: string
}) {
  const { data, loading, error } = useCommunityMySettingsQuery({
    variables: { communityId },
    fetchPolicy: "cache-and-network",
  })
  useSettingsRefreshError(Boolean(data?.community && error))
  const client = useApolloClient()
  const { setPreview, clearPreview } = useCommunityAccentPreview()
  const { snapshot, controller } = useCommunityAccentSave(communityId)
  const [save] = useUpdateCommunitySettingsMutation()

  useEffect(() => {
    const color = data?.community?.mySettings.accentColor
    if (color) controller.initialize(communityId, color)
  }, [communityId, data, controller])

  useEffect(() => {
    controller.configure(communityId, {
      save: async (next) => {
        // The session queue must survive the settings view unmount.
        // ApolloClient.mutate is independent of the useMutation hook lifetime.
        const result = await client.mutate<
          OperationUpdateCommunitySettingsMutation,
          OperationUpdateCommunitySettingsMutationVariables
        >({
          mutation: UpdateCommunitySettingsDocument,
          fetchPolicy: "no-cache",
          errorPolicy: "all",
          variables: { input: { communityId, accentColor: next } },
        })
        const outcome = requireSettingsMutationOutcome(result.data?.updateCommunitySettings, result)
        if (outcome?.__typename === "InputValidationFailure")
          throw new SettingsInputValidationError(outcome.violations)
        const confirmed =
          outcome?.__typename === "UpdateCommunitySettingsSuccess"
            ? outcome.settings.accentColor
            : undefined
        if (!confirmed || !isHex(confirmed))
          throw new Error("Accent save response invalid")
        commitCommunitySettingsPatch(client.cache, communityId, {
          accentColor: confirmed.toUpperCase(),
        })
        return confirmed
      },
      observe: async () => {
        const result = await client.query({
          query: CommunityMySettingsDocument,
          variables: { communityId },
          // Inspection must not mutate a newer confirmed cache snapshot.
          fetchPolicy: "no-cache",
        })
        const current = result.data?.community?.mySettings.accentColor
        if (!current || !isHex(current))
          throw new Error("Community accent unavailable")
        return current
      },
      confirm: (color) =>
        commitCommunitySettingsPatch(client.cache, communityId, {
          accentColor: color,
        }),
      preview: (value) => setPreview(communityId, value),
      release: (owner) => clearPreview(communityId, owner),
    })
  })

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
  const canResave = Boolean(snapshot.draft && isHex(snapshot.draft))

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
            <FeedbackPanel
              kind={failure === "unknown" ? "warning" : "error"}
              role="alert"
              title={
                failure === "unknown"
                  ? "保存結果を確認できませんでした"
                  : failure === "blocked"
                    ? "Community設定を変更できません"
                    : snapshot.validation
                      ? "入力内容を確認してください"
                      : "保存できませんでした"
              }
              actions={
                failure === "blocked" ? undefined : (
                  <>
                  {failure === "unknown" && (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => void controller.inspect(communityId)}
                    >
                      現在の状態を確認
                    </Button>
                  )}
                  {failure === "unknown" && snapshot.observedMatches && (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => controller.confirmObservation(communityId)}
                    >
                      確認完了
                    </Button>
                  )}
                  {(failure === "rejected" ||
                    (failure === "unknown" && snapshot.inspected)) &&
                    !snapshot.observedMatches && (
                      <Button
                        size="xs"
                        disabled={!canResave}
                        onClick={() => controller.retry(communityId)}
                      >
                        もう一度保存
                      </Button>
                    )}
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => controller.discard(communityId)}
                  >
                    変更を破棄
                  </Button>
                  </>
                )
              }
            >
              <Stack gap="xs">
                <Text size="sm">
                  Shellは最後に確認できた色を表示しています。入力内容は保持しています。
                  {failure === "unknown"
                    ? " 現在のServer状態を確認してから、必要に応じて手動で保存してください。"
                    : failure === "blocked"
                      ? " 権限またはSessionを確認し、画面を再読み込みしてください。"
                      : snapshot.validation
                        ? " 入力項目を修正したうえで再保存するか、変更を破棄してください。"
                        : " 内容を確認して、再保存するか変更を破棄してください。"}
                </Text>
                {failure === "unknown" && snapshot.inspected && (
                  <Text size="sm">
                    {snapshot.observedMatches
                      ? "現在のServer値は入力した色と一致しています。旧Mutationの完了を証明するものではありません。"
                      : "現在のServer値と入力した色が一致しません。"}
                  </Text>
                )}
              </Stack>
            </FeedbackPanel>
          ) : undefined
        }
        aliasControl={
          <CommunityAliasControl
            savedAlias={data.community.mySettings.alias}
            onInspect={async () => {
              const current = await client.query({
                query: CommunityMySettingsDocument,
                variables: { communityId },
                fetchPolicy: "no-cache",
              })
              if (!current.data?.community) throw new Error("Community unavailable")
              return current.data.community.mySettings.alias
            }}
            onSave={async (alias) => {
              const result = await save({
                fetchPolicy: "no-cache",
                errorPolicy: "all",
                variables: { input: { communityId, alias } },
              })
              const outcome = requireSettingsMutationOutcome(result.data?.updateCommunitySettings, result)
              if (outcome?.__typename === "InputValidationFailure")
                throw new SettingsInputValidationError(outcome.violations)
              const settings =
                outcome?.__typename === "UpdateCommunitySettingsSuccess"
                  ? outcome.settings
                  : undefined
              if (!settings || settings.alias !== alias) {
                throw new Error("Community alias save unconfirmed")
              }
              commitCommunitySettingsPatch(client.cache, communityId, {
                alias: settings.alias,
              })
              // Both subscribed views share the normalized Community fragment.
              // Refetching either after this write may reintroduce an older
              // Accent/Alias snapshot while the other field is in flight.
            }}
          />
        }
        setAccent={() => undefined}
      />
    </Stack>
  )
}
