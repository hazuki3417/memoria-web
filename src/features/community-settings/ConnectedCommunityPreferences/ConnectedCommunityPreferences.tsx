"use client"

import { useEffect } from "react"
import { Alert, Button, Group, Stack, Text } from "@mantine/core"
import { useApolloClient } from "@apollo/client"
import {
  useCommunityAccentPreview,
  useCommunityAccentSave,
} from "@/features/application-shell/CommunityAccentPreviewContext"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "@/features/settings/useSettingsRefreshError"
import { CommunityPreferencesContent } from "../CommunityPreferencesContent"
import { CommunityAliasControl } from "../CommunityAliasControl"
import {
  CommunityMySettingsDocument,
  CommunitySettingsCacheFragmentDoc,
  MyCommunitiesDocument,
  useCommunityMySettingsQuery,
  useUpdateCommunitySettingsMutation,
  type OperationCommunitySettingsCacheFragment,
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

  // Keep only confirmed Mutation results in the shared Apollo cache.
  // Reading the current fragment protects Alias against unrelated Accent writes.
  const commitConfirmedAccent = (value: string) => {
    const id = client.cache.identify({ __typename: "Community", id: communityId })
    if (!id) return
    const previous = client.cache.readFragment<OperationCommunitySettingsCacheFragment>({
      id,
      fragment: CommunitySettingsCacheFragmentDoc,
    })
    if (!previous) return
    client.cache.writeFragment({
      id,
      fragment: CommunitySettingsCacheFragmentDoc,
      data: {
        __typename: "Community",
        mySettings: {
          __typename: "CommunitySettings",
          accentColor: value,
          alias: previous.mySettings.alias,
        },
      },
    })
  }

  useEffect(() => {
    const color = data?.community?.mySettings.accentColor
    if (color) controller.initialize(communityId, color)
  }, [communityId, data, controller])

  useEffect(() => {
    controller.configure(communityId, {
      save: async (next) => {
        const result = await save({
          variables: { input: { communityId, accentColor: next } },
        })
        const confirmed = result.data?.updateCommunitySettings?.settings?.accentColor
        if (!confirmed || !isHex(confirmed)) throw new Error("Accent save response invalid")
        commitConfirmedAccent(confirmed.toUpperCase())
        return confirmed
      },
      observe: async () => {
        const result = await client.query({
          query: CommunityMySettingsDocument,
          variables: { communityId },
          fetchPolicy: "network-only",
        })
        const current = result.data?.community?.mySettings.accentColor
        if (!current || !isHex(current)) throw new Error("Community accent unavailable")
        return current
      },
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

  return (
    <Stack gap="sm">
      <CommunityPreferencesContent
        key={communityId}
        accent={accent}
        initialDraft={lastDraft}
        isPreview={false}
        preserveDraftOnAccentChange={failure !== null}
        saveStatus={failure ? "attention" : snapshot.status}
        onAccentDraftChange={(value) => controller.edit(communityId, value)}
        saveFeedback={
          failure ? (
            <Alert color="red" role="alert" title={
              failure === "unknown"
                ? "保存結果を確認できませんでした"
                : "保存できませんでした"
            }>
              <Stack gap="xs">
                <Text size="sm">
                  Shellは最後に確認できた色を表示しています。入力内容は保持しています。
                  {failure === "unknown"
                    ? " 現在のServer状態を確認してから、必要に応じて手動で保存してください。"
                    : " 内容を確認して、再保存するか変更を破棄してください。"}
                </Text>
                {failure === "unknown" && snapshot.inspected && (
                  <Text size="sm">
                    {snapshot.observedMatches
                      ? "現在のServer値は入力した色と一致しています。旧Mutationの完了を証明するものではありません。"
                      : "現在のServer値と入力した色が一致しません。"}
                  </Text>
                )}
                <Group gap="xs">
                  {failure === "unknown" && (
                    <Button size="xs" variant="light" onClick={() => void controller.inspect(communityId)}>
                      現在の状態を確認
                    </Button>
                  )}
                  {failure === "unknown" && snapshot.observedMatches && (
                    <Button size="xs" variant="light" onClick={() => controller.confirmObservation(communityId)}>
                      確認完了
                    </Button>
                  )}
                  {(failure === "rejected" || snapshot.inspected) && !snapshot.observedMatches && (
                    <Button size="xs" onClick={() => controller.retry(communityId)}>
                      もう一度保存
                    </Button>
                  )}
                  <Button size="xs" variant="subtle" color="gray"
                    onClick={() => controller.discard(communityId)}>
                    変更を破棄
                  </Button>
                </Group>
              </Stack>
            </Alert>
          ) : undefined
        }
        aliasControl={
          <CommunityAliasControl
            savedAlias={data.community.mySettings.alias}
            onSave={async (alias) => {
              const result = await save({
                variables: { input: { communityId, alias } },
              })
              const settings = result.data?.updateCommunitySettings?.settings
              if (!settings || settings.alias !== alias) {
                throw new Error("Community alias save unconfirmed")
              }
              const id = client.cache.identify({ __typename: "Community", id: communityId })
              if (id) {
                const previous =
                  client.cache.readFragment<OperationCommunitySettingsCacheFragment>({
                    id,
                    fragment: CommunitySettingsCacheFragmentDoc,
                  })
                if (previous) {
                  client.cache.writeFragment({
                    id,
                    fragment: CommunitySettingsCacheFragmentDoc,
                    data: {
                      __typename: "Community",
                      mySettings: {
                        __typename: "CommunitySettings",
                        accentColor: previous.mySettings.accentColor,
                        alias: settings.alias,
                      },
                    },
                  })
                }
              }
              void client.refetchQueries({
                include: [MyCommunitiesDocument, CommunityMySettingsDocument],
              }).catch(() => undefined)
            }}
          />
        }
        setAccent={() => undefined}
      />
    </Stack>
  )
}
