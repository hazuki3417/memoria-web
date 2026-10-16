import "server-only"
import { auth0 } from "@/lib/auth0"

const ME_QUERY = "query CurrentUser { me { id profile { nickname } } }"
const REGISTER_MUTATION =
  "mutation RegisterMemoriaUser($input: RegisterUserInput!) { registerUser(input: $input) { user { id profile { nickname } } } }"

type GraphQLError = { message?: string; extensions?: { code?: string } }
type GraphQLResult<T> = { data?: T; errors?: GraphQLError[] }
export type CurrentUser = { id: string; profile: { nickname: string } }
export type CurrentUserResult =
  | { kind: "active"; user: CurrentUser }
  | { kind: "unregistered" }
  | { kind: "unavailable" }
  | { kind: "error" }
export type RegistrationResult =
  | { kind: "registered"; user: CurrentUser }
  | { kind: "unavailable" | "validation" | "conflict" | "error" }

async function request<T>(
  query: string,
  operationName: string,
  variables?: object,
): Promise<
  { kind: "ok"; result: GraphQLResult<T> } | { kind: "unavailable" | "error" }
> {
  const endpoint = process.env.MEMORIA_GRAPHQL_URL
  if (!endpoint) return { kind: "error" }
  let accessToken: string
  try {
    accessToken = (await auth0.getAccessToken()).token
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
      body: JSON.stringify({ query, operationName, variables }),
      cache: "no-store",
    })
    if (response.status === 401) return { kind: "unavailable" }
    if (!response.ok) return { kind: "error" }
    return { kind: "ok", result: (await response.json()) as GraphQLResult<T> }
  } catch {
    return { kind: "error" }
  }
}

export async function getCurrentMemoriaUser(): Promise<CurrentUserResult> {
  const response = await request<{ me: CurrentUser | null }>(
    ME_QUERY,
    "CurrentUser",
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const { result } = response
  if (result.errors?.length)
    return {
      kind: result.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED")
        ? "unavailable"
        : "error",
    }
  if (!result.data || !("me" in result.data)) return { kind: "error" }
  return result.data.me
    ? { kind: "active", user: result.data.me }
    : { kind: "unregistered" }
}

export async function registerMemoriaUser(
  nickname: string,
): Promise<RegistrationResult> {
  const response = await request<{ registerUser: { user: CurrentUser } }>(
    REGISTER_MUTATION,
    "RegisterMemoriaUser",
    { input: { nickname } },
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const { result } = response
  if (result.errors?.length) {
    if (result.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED"))
      return { kind: "unavailable" }
    if (result.errors.some((e) => e.extensions?.code === "VALIDATION"))
      return { kind: "validation" }
    if (result.errors.some((e) => e.extensions?.code === "CONFLICT"))
      return { kind: "conflict" }
    return { kind: "error" }
  }
  const user = result.data?.registerUser?.user
  return user ? { kind: "registered", user } : { kind: "error" }
}

const UPDATE_PROFILE_MUTATION =
  "mutation UpdateMemoriaUserProfile($input: UpdateUserProfileInput!) { updateUserProfile(input: $input) { user { id profile { nickname } } } }"

export type UpdateProfileResult =
  | { kind: "updated"; user: CurrentUser }
  | { kind: "unavailable" | "validation" | "error" }

export async function updateMemoriaProfile(
  nickname: string,
): Promise<UpdateProfileResult> {
  const response = await request<{ updateUserProfile: { user: CurrentUser } }>(
    UPDATE_PROFILE_MUTATION,
    "UpdateMemoriaUserProfile",
    { input: { nickname } },
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const { result } = response
  if (result.errors?.length) {
    if (result.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED"))
      return { kind: "unavailable" }
    if (result.errors.some((e) => e.extensions?.code === "VALIDATION"))
      return { kind: "validation" }
    return { kind: "error" }
  }
  const user = result.data?.updateUserProfile?.user
  return user ? { kind: "updated", user } : { kind: "error" }
}


export type AccountPreferences = {
  personalAccentColor: string
  dateFormat: "YYYY_MM_DD" | "MM_DD_YYYY" | "DD_MM_YYYY"
  fileSizeUnit: "DECIMAL" | "BINARY"
  mediaThumbnailSize: "SMALL" | "MEDIUM" | "LARGE"
  mediaDetailNavigationWrap: boolean
  mediaDetailInitialInfoWide: boolean
  mediaDetailInitialInfoMedium: boolean
}
export type AccountPreferencesPatch = Partial<AccountPreferences>

const UPDATE_PREFERENCES_MUTATION = `
  mutation SaveUserPreferences($input: UpdateUserPreferencesInput!) {
    updateUserPreferences(input: $input) {
      preferences {
        personalAccentColor dateFormat fileSizeUnit mediaThumbnailSize
        mediaDetailNavigationWrap mediaDetailInitialInfoWide mediaDetailInitialInfoMedium
      }
    }
  }
`

export type UpdatePreferencesResult =
  | { kind: "updated"; preferences: AccountPreferences }
  | { kind: "unavailable" | "validation" | "error" }

export async function updateMemoriaPreferences(
  patch: AccountPreferencesPatch,
): Promise<UpdatePreferencesResult> {
  const response = await request<{
    updateUserPreferences: { preferences: AccountPreferences }
  }>(UPDATE_PREFERENCES_MUTATION, "SaveUserPreferences", { input: patch })
  if (response.kind !== "ok") return { kind: response.kind }
  const { result } = response
  if (result.errors?.length) {
    if (result.errors.some((error) => error.extensions?.code === "UNAUTHENTICATED"))
      return { kind: "unavailable" }
    if (result.errors.some((error) => error.extensions?.code === "VALIDATION"))
      return { kind: "validation" }
    return { kind: "error" }
  }
  const preferences = result.data?.updateUserPreferences?.preferences
  return preferences ? { kind: "updated", preferences } : { kind: "error" }
}
