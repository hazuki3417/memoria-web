"use client"
import { PageInfo } from "@/graphql"
import { ActionStateType } from "@/hooks/type"
import {
  ApolloError,
  ApolloQueryResult,
  OperationVariables,
  QueryResult,
} from "@apollo/client"
import "client-only"
import { useCallback, useEffect, useMemo, useState } from "react"

export type UseRelayConnectionAction = ActionStateType<"prev" | "next">

export type UseRelayConnectionState<TEdge> = {
  edges: TEdge[]
  pageInfo: PageInfo | undefined
  loading: boolean
  error: ApolloError | undefined
  meta: { action: UseRelayConnectionAction }
}

export interface UseRelayConnectionOption<
  TData,
  TVariables extends OperationVariables,
  TEdge,
> {
  hooks: () => QueryResult<TData, TVariables>
  extract: (data: TData) => {
    edges: TEdge[]
    pageInfo: PageInfo
  }
  size: number
}

export interface UseRelayConnectionHandler<TData> {
  prev: () => Promise<ApolloQueryResult<TData>>
  next: () => Promise<ApolloQueryResult<TData>>
}

export interface UseRelayConnection<TData, TEdge> {
  state: UseRelayConnectionState<TEdge>
  handler: UseRelayConnectionHandler<TData>
}

export const useRelayConnection = <
  TData,
  TVariables extends OperationVariables,
  TEdge,
>(
  option: UseRelayConnectionOption<TData, TVariables, TEdge>,
): UseRelayConnection<TData, TEdge> => {
  const { hooks, extract, size } = option
  const [action, setAction] = useState<UseRelayConnectionAction>("idle")

  const { data, loading, error, fetchMore, networkStatus } = hooks()

  const connection = useMemo(
    () => (data ? extract(data) : undefined),
    [data, extract],
  )

  const prev = useCallback(async () => {
    if (!connection?.pageInfo.hasPrevPage) {
      return Promise.reject(new Error("no prev page"))
    }

    setAction("prev")

    return fetchMore({
      variables: {
        input: {
          last: size,
          before: connection.pageInfo.startCursor,
        },
      },
    })
  }, [connection, fetchMore, size])

  const next = useCallback(async () => {
    if (!connection?.pageInfo.hasNextPage) {
      return Promise.reject(new Error("no next page"))
    }

    setAction("next")

    return await fetchMore({
      variables: {
        input: {
          first: size,
          after: connection.pageInfo.endCursor,
        },
      },
    })
  }, [connection, fetchMore, size])

  useEffect(() => {
    if (!loading) setAction("idle")
  }, [loading])

  return {
    state: {
      edges: connection?.edges ?? [],
      pageInfo: connection?.pageInfo,
      loading,
      error,
      meta: { action },
    },
    handler: { prev, next },
  }
}
