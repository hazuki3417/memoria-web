"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, Stack } from "@mantine/core"
import { SettingsLoadBoundary } from "@/features/settings/SettingsLoadBoundary"
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client"
import { CommunityPreferencesContent } from "./CommunityPreferencesContent"
import { CommunityAliasControl } from "./CommunityAliasControl"
import { MyCommunitiesDocument } from "@/infrastructure/graphql/generated"

const COMMUNITY_SETTINGS = gql`
  query CommunityAccentSettings($communityId: ID!) {
    community(communityId: $communityId) { id mySettings { accentColor alias } }
  }
`
const SAVE_COMMUNITY_SETTINGS = gql`
  mutation SaveCommunityAccent($input: UpdateCommunitySettingsInput!) {
    updateCommunitySettings(input: $input) { settings { accentColor alias } }
  }
`

type SettingsResult = {
  community: {
    id: string
    mySettings: { accentColor: string; alias: string | null }
  } | null
}
type SaveResult = {
  updateCommunitySettings: {
    settings: { accentColor: string; alias: string | null }
  }
}
const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

export function ConnectedCommunityPreferences({
  communityId,
}: {
  communityId: string
}) {
  const { data, loading } = useQuery<SettingsResult>(
    COMMUNITY_SETTINGS,
    {
      variables: { communityId },
      fetchPolicy: "cache-and-network",
    },
  )
  const client = useApolloClient()
  const [save] = useMutation<SaveResult>(SAVE_COMMUNITY_SETTINGS)
  const [accent, setAccent] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const saved = useRef<string | null>(null)
  const desired = useRef<string | null>(null)
  const inFlight = useRef(false)
  const active = useRef(true)

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  // A server refresh must not replace a newer unsaved user selection.
  useEffect(() => {
    const value = data?.community?.mySettings.accentColor
    if (value && !inFlight.current && desired.current === null) {
      saved.current = value
      setAccent(value)
    }
  }, [data])

  const applyContextAccent = useCallback(
    (value: string) => {
      const id = client.cache.identify({
        __typename: "Community",
        id: communityId,
      })
      if (!id) return
      const fragment = gql`
      fragment CommunityAccentCache on Community {
        mySettings { accentColor alias }
      }
    `
      const previous = client.cache.readFragment<{
        mySettings: { accentColor: string; alias: string | null }
      }>({ id, fragment })
      if (!previous) return
      client.cache.writeFragment({
        id,
        fragment,
        data: {
          __typename: "Community",
          mySettings: {
            __typename: "CommunitySettings",
            accentColor: value,
            alias: previous.mySettings.alias,
          },
        },
      })
    },
    [client, communityId],
  )

  const flush = useCallback(async () => {
    if (inFlight.current || desired.current === null) return
    inFlight.current = true
    if (active.current) setSaving(true)
    try {
      while (desired.current !== null) {
        const next = desired.current
        desired.current = null
        const result = await save({
          variables: {
            input: { communityId, accentColor: next.toUpperCase() },
          },
        })
        const confirmed =
          result.data?.updateCommunitySettings?.settings?.accentColor
        if (!confirmed || !isHex(confirmed)) throw new Error("Save unconfirmed")
        saved.current = confirmed
        if (desired.current === null) applyContextAccent(confirmed)
      }
      if (active.current) setSaveError(false)
    } catch {
      desired.current = null
      // The Shell can outlive this route: always restore shared cache even
      // if the preferences screen was unmounted while saving.
      if (saved.current) applyContextAccent(saved.current)
      if (active.current) {
        setAccent(saved.current)
        setSaveError(true)
      }
    } finally {
      inFlight.current = false
      if (active.current) setSaving(false)
    }
  }, [communityId, save, applyContextAccent])

  const choose = (value: string) => {
    if (!isHex(value)) return
    const normalized = value.toUpperCase()
    setAccent(normalized)
    applyContextAccent(normalized)
    desired.current = normalized
    setSaveError(false)
    void flush()
  }

  if (!data?.community) {
    return (
      <SettingsLoadBoundary state={loading ? "loading" : "error"} label="Community環境設定を読み込み中">
        {null}
      </SettingsLoadBoundary>
    )
  }

  return (
    <Stack gap="sm">
      {saveError && (
        <Alert color="red" title="保存できませんでした">
          最後に保存できた色へ戻しました。色を選び直して再試行してください。
        </Alert>
      )}
      <CommunityPreferencesContent
        accent={accent ?? data.community.mySettings.accentColor}
        isPreview={false}
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
              // Mutationの成立を確認した時点で、ShellとPreferencesの同じ参照元を更新する。
              const id = client.cache.identify({
                __typename: "Community",
                id: communityId,
              })
              if (id) {
                const fragment = gql`
                  fragment CommunityAliasCache on Community {
                    mySettings { accentColor alias }
                  }
                `
                const previous = client.cache.readFragment<{
                  mySettings: { accentColor: string; alias: string | null }
                }>({ id, fragment })
                if (previous) {
                  client.cache.writeFragment({
                    id,
                    fragment,
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
              // 再取得の通信失敗は確定済みMutationを失敗扱いしない。
              void client
                .refetchQueries({
                  include: [MyCommunitiesDocument, COMMUNITY_SETTINGS],
                })
                .catch(() => undefined)
            }}
          />
        }
        setAccent={(next) => {
          const current = accent ?? data.community!.mySettings.accentColor
          choose(typeof next === "function" ? next(current) : next)
        }}
      />
      {saving && <span role="status">保存中...</span>}
    </Stack>
  )
}
