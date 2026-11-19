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
        value.operationId.length === 0 ||
        !("revision" in value) || typeof value.revision !== "string" ||
        value.revision.length === 0
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
      // React State更新前の連続操作でも、保存済みの受付Attemptを上書きしない。
      // 不明・破損を含め既存の値があれば、新しいMutationの発行は許可しない。
      if (window.sessionStorage.getItem(storageKey(communityId)) !== null) return null
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

  const markUnknown = (operationId: string) => {
    setState((current) => current.status === "ready" &&
      current.communityId === communityId &&
      current.operation?.operationId === operationId
      ? { ...current, recovered: true }
      : current)
  }

  const clearRejected = (operationId: string) => {
    // 確定的な拒否が返ったAttemptだけを解除する。古い応答では後続Attemptを解放しない。
    if (state.status !== "ready" || state.communityId !== communityId) return
    try {
      const raw = window.sessionStorage.getItem(storageKey(communityId))
      if (!raw) {
        setState({ status: "unavailable", communityId })
        return
      }
      const stored: unknown = JSON.parse(raw)
      if (!stored || typeof stored !== "object" || !("operationId" in stored) ||
        stored.operationId !== operationId) return
      window.sessionStorage.removeItem(storageKey(communityId))
      setState({ status: "ready", communityId, operation: null, recovered: false })
    } catch {
      // 破損やStorage異常は未受付の根拠ではない。
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
