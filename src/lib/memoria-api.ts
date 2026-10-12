import "server-only"
import { auth0 } from "@/lib/auth0"

const ME_QUERY = "query CurrentUser { me { id profile { nickname } } }"

type GraphQLError = { message?: string; extensions?: { code?: string } }
type GraphQLResult<T> = { data?: T; errors?: GraphQLError[] }

export type CurrentUser = { id: string; profile: { nickname: string } }

export type CurrentUserResult =
  | { kind: "active"; user: CurrentUser }
  | { kind: "unregistered" }
  | { kind: "unavailable" }
  | { kind: "error" }

export async function getCurrentMemoriaUser(): Promise<CurrentUserResult> {
  const endpoint = process.env.MEMORIA_GRAPHQL_URL
  if (!endpoint) return { kind: "error" }

  let accessToken: string
  try {
    const token = await auth0.getAccessToken()
    accessToken = token.token
  } catch {
    return { kind: "unavailable" }
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: ME_QUERY }),
      cache: "no-store",
    })
    if (response.status === 401) return { kind: "unavailable" }
    if (!response.ok) return { kind: "error" }

    const result = (await response.json()) as GraphQLResult<{
      me: CurrentUser | null
    }>
    if (result.errors?.length) {
      return result.errors.some(
        (error) => error.extensions?.code === "UNAUTHENTICATED",
      )
        ? { kind: "unavailable" }
        : { kind: "error" }
    }
    if (!result.data || !("me" in result.data)) return { kind: "error" }
    return result.data.me
      ? { kind: "active", user: result.data.me }
      : { kind: "unregistered" }
  } catch {
    return { kind: "error" }
  }
}
