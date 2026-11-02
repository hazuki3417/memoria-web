"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, Stack } from "@mantine/core"
import type { SaveStatusState } from "@/components/SaveStatus"
import { useCommunityAccentPreview } from "@/features/application-shell/CommunityAccentPreviewContext"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { useSettingsRefreshError } from "@/features/settings/useSettingsRefreshError"
import { useApolloClient } from "@apollo/client"
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
  const [save] = useUpdateCommunitySettingsMutation()
  const [accent, setAccent] = useState<string | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatusState>("idle")
  const saved = useRef<string | null>(null)
  const desired = useRef<string | null>(null)
  const inFlight = useRef(false)
  const hasIncompleteDraft = useRef(false)
  const active = useRef(true)

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
      clearPreview(communityId)
    }
  }, [communityId, clearPreview])

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
      const previous =
        client.cache.readFragment<OperationCommunitySettingsCacheFragment>({
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
    },
    [client, communityId],
  )

  const flush = useCallback(async () => {
    if (inFlight.current || desired.current === null) return
    inFlight.current = true
    if (active.current) {
      setSaveStatus("saving")
    }
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
        // Only confirmed mutation results may update Apollo. A newer draft
        // continues to be shown through the independent Shell preview.
        applyContextAccent(confirmed)
        if (desired.current === null) clearPreview(communityId)
      }
      if (active.current) {
        setSaveError(false)
        setSaveStatus(hasIncompleteDraft.current ? "pending" : "saved")
      }
    } catch {
      desired.current = null
      // The Shell can outlive this route: always restore shared cache even
      // if the preferences screen was unmounted while saving.
      clearPreview(communityId)
      if (active.current) {
        setAccent(saved.current)
        setSaveError(true)
        setSaveStatus("attention")
      }
    } finally {
      inFlight.current = false
    }
  }, [communityId, save, applyContextAccent, clearPreview])

  const choose = (value: string) => {
    if (!isHex(value)) return
    const normalized = value.toUpperCase()
    setAccent(normalized)
    setPreview(communityId, normalized)
    desired.current = normalized
    setSaveError(false)
    setSaveStatus("pending")
    void flush()
  }

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

  const resolvedCommunity = data.community

  return (
    <Stack gap="sm">
      <CommunityPreferencesContent
        accent={accent ?? resolvedCommunity.mySettings.accentColor}
        isPreview={false}
        preserveDraftOnAccentChange={saveError}
        saveStatus={saveError ? "attention" : saveStatus}
        saveFeedback={
          saveError ? (
            <Alert color="red" title="保存できませんでした" role="alert">
              Shellは最後に保存できた色へ戻しました。入力した色は保持しています。内容を確認し、必要であればもう一度選択して保存してください。
            </Alert>
          ) : undefined
        }
        onDraftValidityChange={(valid) => {
          hasIncompleteDraft.current = !valid
          if (!valid) setSaveStatus("pending")
        }}
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
              // 再取得の通信失敗は確定済みMutationを失敗扱いしない。
              void client
                .refetchQueries({
                  include: [MyCommunitiesDocument, CommunityMySettingsDocument],
                })
                .catch(() => undefined)
            }}
          />
        }
        setAccent={(next) => {
          const current = accent ?? resolvedCommunity.mySettings.accentColor
          choose(typeof next === "function" ? next(current) : next)
        }}
      />
    </Stack>
  )
}
