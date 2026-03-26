import { FieldPolicy, InMemoryCache } from "@apollo/client"
import { relayStylePagination } from "@apollo/client/utilities"

const relayStylePaginationForImages = (): FieldPolicy<any> => {
  return {
    keyArgs: false,

    merge(existing, incoming, { args }) {
      if (!existing) return incoming

      const existingEdges = existing.edges ?? []
      const incomingEdges = incoming.edges ?? []

      let edges: any[]

      // forward pagination
      if (args?.after) {
        edges = [...existingEdges, ...incomingEdges]
      }
      // backward pagination
      else if (args?.before) {
        edges = [...incomingEdges, ...existingEdges]
      }
      // refetch or initial
      else {
        edges = incomingEdges
      }

      // cursorベースで重複排除（重要）
      const seen = new Set<string>()
      edges = edges.filter((edge) => {
        if (!edge?.cursor) return true
        if (seen.has(edge.cursor)) return false
        seen.add(edge.cursor)
        return true
      })

      return {
        ...incoming,
        edges,

        pageInfo: {
          ...existing.pageInfo,
          ...incoming.pageInfo,
        },
      }
    },

    read(existing) {
      return existing
    },
  }
}

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        images: relayStylePagination(["filter"]),
        imageGroups: relayStylePagination(["filter"]),
        imageGroup: {
          keyArgs: ["input"],
        },
      },
    },
    ImageGroup: {
      fields: {
        images: relayStylePaginationForImages(),
      },
    },
  },
})
