"use client"

import { gql, NetworkStatus, useQuery } from "@apollo/client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  projectCollection,
  projectMediaDetail,
  projectPreview,
  nextProcessingPollFailures,
  processingPollDelay,
  mediaDetailPollingIdentity,
  mergeDetailCollectionPages,
  type MediaDetailResult,
} from "./mediaDetailReadState"

/**
 * Query identity from media(id:) instead of borrowing a browser thumbnail.
 * Scope is explicit: only the matching Personal/Community relations are requested.
 */
export const MEDIA_DETAIL_READ = gql`
  query MediaDetailRead($id: ID!, $scope: ScopeInput!, $groupsAfter: String, $tagsAfter: String) {
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
      groups(scope: $scope, first: 100, after: $groupsAfter) {
        edges { node { id name } }
        pageInfo { hasNextPage endCursor }
      }
      tags(scope: $scope, first: 100, after: $tagsAfter) {
        edges { node { id name } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`

export type MediaDetailScope = {
  type: "PERSONAL" | "COMMUNITY"
  communityId?: string
}

export function useMediaDetailRead(mediaId: string | null, scope: MediaDetailScope) {
  const query = useQuery<MediaDetailResult, { id: string; scope: MediaDetailScope; groupsAfter?: string; tagsAfter?: string }>(
    MEDIA_DETAIL_READ,
    {
      variables: { id: mediaId ?? "", scope },
      skip: mediaId === null,
      fetchPolicy: "network-only",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
  )

  const pollKey = mediaDetailPollingIdentity(mediaId, scope)
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

  const pageInFlight = useRef<string | null>(null)
  const [pageFailure, setPageFailure] = useState<string | null>(null)

  // Each result belongs to the currently selected media and relation scope.
  // A failed/malformed cursor keeps the collection incomplete; no false empty.
  useEffect(() => {
    if (detail.kind !== "ready" || query.loading || query.error || !pollKey) return
    for (const field of ["groups", "tags"] as const) {
      const collection = detail.media[field]
      if (!collection?.pageInfo.hasNextPage) continue
      const cursor = collection.pageInfo.endCursor
      if (!cursor) continue
      const requestKey = JSON.stringify([pollKey, field, cursor])
      if (pageFailure === requestKey || pageInFlight.current !== null) return
      pageInFlight.current = requestKey
      void query.fetchMore({
        variables: field === "groups" ? { groupsAfter: cursor } : { tagsAfter: cursor },
        updateQuery(previous, { fetchMoreResult }) {
          if (!fetchMoreResult?.media || fetchMoreResult.media.id !== previous.media?.id || !previous.media) return previous
          const incoming = fetchMoreResult.media[field]
          const existing = previous.media[field]
          if (!incoming || !existing) return previous
          return {
            media: {
              ...previous.media,
              [field]: mergeDetailCollectionPages(existing, incoming),
            },
          }
        },
      }).catch(() => setPageFailure(requestKey))
        .finally(() => {
          if (pageInFlight.current === requestKey) pageInFlight.current = null
        })
      return
    }
  }, [detail, pollKey, pageFailure, query.loading, query.error, query.fetchMore])

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
  }, [shouldPoll, pollDelay, pollKey, mediaId, query.refetch])

  const retryDetail = useCallback(() => {
    if (mediaId) setPollState({ id: pollKey, failures: 0, stopped: false })
    return query.refetch()
  }, [pollKey, mediaId, query.refetch])

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
