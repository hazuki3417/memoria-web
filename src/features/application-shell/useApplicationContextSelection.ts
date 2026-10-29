import { useEffect, useState } from "react"
import type { ApplicationContextOption } from "./types"

/**
 * URLがContext選択の基準。設定画面では最後に訪問したContextを保持する。
 * Routerの遷移とデータ取得は呼び出し元が担当する。
 */
export function useApplicationContextSelection(pathname: string) {
  const [rememberedContextKind, setRememberedContextKind] = useState<
    ApplicationContextOption["kind"]
  >("personal")
  const [rememberedCommunityId, setRememberedCommunityId] = useState("")
  const communityMatch = pathname.match(/^\/communities\/([^/]+)/)
  const isSettingsRoute = pathname.startsWith("/settings")
  const contextKind = communityMatch
    ? "community"
    : isSettingsRoute
      ? rememberedContextKind
      : "personal"
  const communityId = communityMatch?.[1] ?? rememberedCommunityId

  useEffect(() => {
    const routeCommunityMatch = pathname.match(/^\/communities\/([^/]+)/)
    if (routeCommunityMatch) {
      setRememberedContextKind("community")
      setRememberedCommunityId(routeCommunityMatch[1])
    } else if (!pathname.startsWith("/settings")) {
      setRememberedContextKind("personal")
    }
  }, [pathname])

  return {
    contextKind,
    communityId,
    setRememberedContextKind,
    setRememberedCommunityId,
  }
}
