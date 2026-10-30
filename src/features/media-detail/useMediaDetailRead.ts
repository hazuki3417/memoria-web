"use client"

import { gql, NetworkStatus, useQuery } from "@apollo/client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  projectCollection,
  projectMediaDetail,
  projectPreview,
  nextProcessingPollFailures,
  processingPollDelay,
  type MediaDetailResult,
} from "./mediaDetailReadState"

/**
 * Query identity from media(id:) instead of borrowing a browser thumbnail.
 * Scope is explicit: only the matching Personal/Community relations are requested.
 */
export const MEDIA_DETAIL_READ = gql`
  query MediaDetailRead($id: ID!, $scope: ScopeInput!) {
    media(id: $id) {
      id
      originalFileName
      fileSize
      uploadedAt
      uploadedBy { nickname deleted }
      processing { status }
      image {
        width
        height
        variants { width height url }
      }
      groups(scope: $scope, first: 100) {
        edges { node { id name } }
        pageInfo { hasNextPage }
      }
      tags(scope: $scope, first: 100) {
        edges { node { id name } }
        pageInfo { hasNextPage }
      }
    }
  }
`

export type MediaDetailScope = {
  type: "PERSONAL" | "COMMUNITY"
  communityId?: string
}

export function useMediaDetailRead(mediaId: string | null, scope: MediaDetailScope) {
  const query = useQuery<MediaDetailResult, { id: string; scope: MediaDetailScope }>(
    MEDIA_DETAIL_READ,
    {
      variables: { id: mediaId ?? "", scope },
      skip: mediaId === null,
      fetchPolicy: "network-only",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
  )

  const pollKey = mediaId === null ? null : `${mediaId}:${scope.type}:${scope.communityId ?? ""}`
  const [visible, setVisible] = useState(true)
  const [pollState, setPollState] = useState<{ id: string | null; failures: number; stopped: boolean }>({ id: null, failures: 0, stopped: false })
  const activePoll = pollState.id === pollKey ? pollState : { id: pollKey, failures: 0, stopped: false }
  const requestInFlight = useRef<string | null>(null)

  useEffect(() => {
    setPollState({ id: pollKey, failures: 0, stopped: false })
    const syncVisibility = () => setVisible(!document.hidden)
    syncVisibility()
    document.addEventListener("visibilitychange", syncVisibility)
    return () => document.removeEventListener("visibilitychange", syncVisibility)
  }, [pollKey])

  // A scope change may retain the same media ID but must never expose previous-scope data.
  const variablesChanging = query.networkStatus === NetworkStatus.setVariables
  const detail = useMemo(
    () => projectMediaDetail(mediaId, query.loading, variablesChanging ? undefined : query.data, Boolean(query.error)),
    [mediaId, query.loading, query.data, query.error, variablesChanging],
  )
  const preview = useMemo(() => projectPreview(detail), [detail])
  // Any partial GraphQL error is conservatively not treated as a confirmed empty list.
  // Later independent per-field queries can refine which section failed.
  const groups = useMemo(
    () => projectCollection(detail, "groups", Boolean(query.error)),
    [detail, query.error],
  )
  const tags = useMemo(
    () => projectCollection(detail, "tags", Boolean(query.error)),
    [detail, query.error],
  )

  const processing = detail.kind === "ready" && detail.media.processing?.status === "PROCESSING"
  const shouldPoll = Boolean(mediaId && visible && processing && !activePoll.stopped)
  const pollDelay = processingPollDelay(activePoll.failures)

  useEffect(() => {
    if (!shouldPoll || !mediaId || pollDelay === null) return
    let cancelled = false
    const timer = window.setInterval(() => {
      if (cancelled || requestInFlight.current === pollKey) return
      requestInFlight.current = pollKey
      void query.refetch().then(
        (result) => {
          if (cancelled) return
          if (result.error?.networkError) {
            setPollState((current) => {
              const failures = nextProcessingPollFailures(current.id === pollKey ? current.failures : 0, true)
              return { id: pollKey, failures, stopped: failures >= 3 }
            })
          } else {
            setPollState({ id: pollKey, failures: 0, stopped: false })
          }
        },
        () => {
          if (!cancelled) setPollState((current) => {
            const failures = nextProcessingPollFailures(current.id === pollKey ? current.failures : 0, true)
            return { id: pollKey, failures, stopped: failures >= 3 }
          })
        },
      ).finally(() => { if (requestInFlight.current === pollKey) requestInFlight.current = null })
    }, pollDelay)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [shouldPoll, pollDelay, pollKey, mediaId, query.refetch]

  const retryDetail = useCallback(() => {
    if (mediaId) setPollState({ id: pollKey, failures: 0, stopped: false })
    return query.refetch()
  }, [pollKey, mediaId, query.refetch]

  return {
    detail,
    preview,
    groups,
    tags,
    pollingStopped: activePoll.stopped,
    pollingFailures: activePoll.failures,
    retryDetail,
  }
}
