"use client"

import { gql, useQuery } from "@apollo/client"
import { useMemo } from "react"
import {
  projectCollection,
  projectMediaDetail,
  projectPreview,
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

  const detail = useMemo(
    () => projectMediaDetail(mediaId, query.loading, query.data, Boolean(query.error)),
    [mediaId, query.loading, query.data, query.error],
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

  return {
    detail,
    preview,
    groups,
    tags,
    retryDetail: () => query.refetch(),
  }
}
