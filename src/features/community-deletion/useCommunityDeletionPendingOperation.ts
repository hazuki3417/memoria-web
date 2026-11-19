"use client"

import { useEffect, useState } from "react"

export type CommunityDeletionPendingOperation = {
  operationId: string
  revision: string
}

type PendingState =
  | { status: "loading" }
  | { status: "unavailable"; communityId: string }
  | { status: "ready"; communityId: string; operation: CommunityDeletionPendingOperation | null; recovered: boolean }

const storageKey = (communityId: string) => `memoria:community-deletion:${communityId}`

/**
 * 受付結果の不明な操作を、Confirmationの再Mount・Snapshot更新・同一Tab内の再読み込みを
 * またいで保持する。保存できない環境では破壊的操作を開始しない。
 */
export const useCommunityDeletionPendingOperation = (communityId: string) => {
  const [state, setState] = useState<PendingState>({ status: "loading" })

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey(communityId))
      if (!raw) {
        setState({ status: "ready", communityId, operation: null, recovered: false })
        return
      }
      const value: unknown = JSON.parse(raw)
      if (
        !value || typeof value !== "object" ||
        !("operationId" in value) || typeof value.operationId !== "string" ||
        !("revision" in value) || typeof value.revision !== "string"
      ) {
        // 不正・破損した記録を消すと、受付結果不明の操作を再送できてしまう。
        setState({ status: "unavailable", communityId })
        return
      }
      setState({ status: "ready", communityId, recovered: true, operation: {
        operationId: value.operationId, revision: value.revision,
      } })
    } catch {
      setState({ status: "unavailable", communityId })
    }
  }, [communityId])

  const begin = (revision: string): string | null => {
    if (state.status !== "ready" || state.communityId !== communityId || state.operation) return null
    try {
      const operationId = crypto.randomUUID()
      const operation = { operationId, revision }
      window.sessionStorage.setItem(storageKey(communityId), JSON.stringify(operation))
      setState({ status: "ready", communityId, operation, recovered: false })
      return operationId
    } catch {
      setState({ status: "unavailable", communityId })
      return null
    }
  }

  const markUnknown = () => {
    setState((current) => current.status === "ready" && current.communityId === communityId && current.operation
      ? { ...current, recovered: true }
      : current)
  }

  const clearRejected = () => {
    // 明示未受付・Revision競合など、成立していないと確定した場合のみ解除する。
    if (state.status !== "ready" || state.communityId !== communityId) return
    try {
      window.sessionStorage.removeItem(storageKey(communityId))
      setState({ status: "ready", communityId, operation: null, recovered: false })
    } catch {
      setState({ status: "unavailable", communityId })
    }
  }

  const scoped = state.status !== "loading" && state.communityId !== communityId
    ? null
    : state

  return {
    status: scoped?.status ?? "loading",
    operation: scoped?.status === "ready" ? scoped.operation : null,
    recovering: scoped?.status === "ready" && scoped.recovered,
    begin,
    markUnknown,
    clearRejected,
  }
}
