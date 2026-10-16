"use client"

import { useEffect, useState } from "react"
import { Text } from "@mantine/core"
import { useRouter } from "next/navigation"
import { showNotification } from "@/components/Feedback"
import { getCommunityDetailsAction, renameCommunityAction } from "./actions"
import {
  CommunitySettings,
  type CommunitySettingsSection,
} from "./CommunitySettings"

export function CommunitySettingsRoute({
  communityId,
  section = "general",
}: {
  communityId: string
  section?: CommunitySettingsSection
}) {
  const router = useRouter()
  const [name, setName] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setName(null)
    setLoadError(false)
    void getCommunityDetailsAction(communityId).then((result) => {
      if (cancelled) return
      if (result.kind === "loaded") setName(result.community.name)
      else setLoadError(true)
    }).catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [communityId])

  if (loadError) return <Text c="red">Community情報を取得できませんでした。再読み込みしてください。</Text>
  if (name === null) return <Text c="dimmed">Community情報を読み込み中です。</Text>

  return (
    <CommunitySettings
      communityId={communityId}
      communityName={name}
      section={section}
      onNavigate={(href) => router.push(href)}
      onSaveName={async (nextName) => {
        try {
          const result = await renameCommunityAction(communityId, nextName)
          if (result.kind === "updated") {
            setName(result.community.name)
            window.dispatchEvent(new CustomEvent("memoria:community-renamed", {
              detail: { id: result.community.id, name: result.community.name },
            }))
            return true
          }
          showNotification({
            kind: "error",
            title: result.kind === "forbidden" ? "Community名を変更する権限がありません" : "Community名を変更できませんでした",
          })
          return false
        } catch {
          showNotification({ kind: "error", title: "Community名を変更できませんでした" })
          return false
        }
      }}
    />
  )
}
