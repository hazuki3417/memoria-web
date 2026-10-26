/**
 * Media Update GraphQL transport. Auth0 credentials remain in the same-origin
 * /api/graphql proxy. This module is safe to call from client components.
 */
export type MediaUpdateScope =
  | { type: "PERSONAL" }
  | { type: "COMMUNITY"; communityId: string }

export type MediaTagDesired = { id?: string | null; name: string }
export type MediaTagEditState = {
  mediaId: string
  tagIds: string[]
  stateToken: string
}
export type MediaTagRecord = { id: string; name: string }
export type GraphQLMediaUpdateError =
  | "conflict"
  | "validation"
  | "unavailable"
  | "forbidden"
  | "error"

export type MediaUpdateResult<T> =
  | { kind: "ok"; value: T }
  | { kind: GraphQLMediaUpdateError }

type GraphQLResponse<T> = {
  data?: T
  errors?: { message?: string; extensions?: { code?: string } }[]
}

const EDIT_STATE_QUERY = `query GetMediaTagEditState($mediaId: ID!, $scope: ScopeInput!) {
  mediaTagEditState(mediaId: $mediaId, scope: $scope) {
    mediaId tagIds stateToken
  }
}`
const TAGS_QUERY = `query GetMediaUpdateTags($scope: ScopeInput!, $after: String) {
  mediaTags(scope: $scope, first: 100, after: $after) {
    edges { node { id name } }
    pageInfo { hasNextPage endCursor }
  }
}`
const SAVE_MUTATION = `mutation SaveMediaUpdateTags($input: UpdateMediaTagsInput!) {
  updateMediaTags(input: $input) { mediaId stateToken }
}`

async function graphql<T>(
  query: string,
  operationName: string,
  variables: Record<string, unknown>,
): Promise<MediaUpdateResult<T>> {
  try {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, operationName, variables }),
      cache: "no-store",
    })
    if (response.status === 401 || response.status === 503) {
      return { kind: "unavailable" }
    }
    if (!response.ok) return { kind: "error" }
    const body = (await response.json()) as GraphQLResponse<T>
    if (body.errors?.length) {
      const codes = body.errors.map((error) => error.extensions?.code)
      if (codes.includes("CONFLICT")) return { kind: "conflict" }
      if (codes.includes("VALIDATION")) return { kind: "validation" }
      if (codes.includes("FORBIDDEN")) return { kind: "forbidden" }
      if (codes.includes("UNAUTHENTICATED")) return { kind: "unavailable" }
      return { kind: "error" }
    }
    return body.data ? { kind: "ok", value: body.data } : { kind: "error" }
  } catch {
    return { kind: "unavailable" }
  }
}

export async function readMediaTagEditState(
  mediaId: string,
  scope: MediaUpdateScope,
): Promise<MediaUpdateResult<MediaTagEditState>> {
  const response = await graphql<{ mediaTagEditState: MediaTagEditState }>(
    EDIT_STATE_QUERY,
    "GetMediaTagEditState",
    { mediaId, scope },
  )
  return response.kind === "ok"
    ? { kind: "ok", value: response.value.mediaTagEditState }
    : response
}

export async function listMediaUpdateTags(
  scope: MediaUpdateScope,
): Promise<MediaUpdateResult<MediaTagRecord[]>> {
  const records: MediaTagRecord[] = []
  let after: string | null = null
  const seen = new Set<string>()
  do {
    const response: MediaUpdateResult<{
      mediaTags: {
        edges: { node: MediaTagRecord }[]
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
    }> = await graphql(TAGS_QUERY, "GetMediaUpdateTags", { scope, after })
    if (response.kind !== "ok") return response
    const page: { edges: { node: MediaTagRecord }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } = response.value.mediaTags
    records.push(...page.edges.map((edge) => edge.node))
    if (!page.pageInfo.hasNextPage) break
    const cursor: string | null = page.pageInfo.endCursor
    if (!cursor || seen.has(cursor)) return { kind: "error" }
    seen.add(cursor)
    after = cursor
  } while (true)
  return { kind: "ok", value: records }
}

export async function saveMediaTags(
  mediaId: string,
  scope: MediaUpdateScope,
  expectedStateToken: string,
  tags: MediaTagDesired[],
): Promise<MediaUpdateResult<{ mediaId: string; stateToken: string }>> {
  const response = await graphql<{
    updateMediaTags: { mediaId: string; stateToken: string }
  }>(SAVE_MUTATION, "SaveMediaUpdateTags", {
    input: { mediaId, scope, expectedStateToken, tags },
  })
  return response.kind === "ok"
    ? { kind: "ok", value: response.value.updateMediaTags }
    : response
}

/**
 * Resolve the complete name-based UI draft against the scoped catalog.
 * Unseen names are sent without an ID and are resolved/created by the API.
 */
export function toDesiredMediaTags(
  draft: readonly string[],
  catalog: readonly MediaTagRecord[],
): MediaTagDesired[] {
  const byName = new Map(catalog.map((tag) => [tag.name, tag.id]))
  return [...new Set(draft.map((name) => name.trim()).filter(Boolean))].map(
    (name) => ({ name, ...(byName.has(name) ? { id: byName.get(name) } : {}) }),
  )
}
