import "server-only"
import { auth0 } from "@/lib/auth0"

const ME_QUERY = "query CurrentUser { me { id profile { nickname } preferences { personalAccentColor dateFormat fileSizeUnit mediaThumbnailSize mediaDetailNavigationWrap mediaDetailInitialInfoWide mediaDetailInitialInfoMedium } } }"
const REGISTER_MUTATION =
  "mutation RegisterMemoriaUser($input: RegisterUserInput!) { registerUser(input: $input) { user { id profile { nickname } } } }"

type GraphQLError = { message?: string; extensions?: { code?: string } }
type GraphQLResult<T> = { data?: T; errors?: GraphQLError[] }
export type CurrentUser = { id: string; profile: { nickname: string }; preferences: AccountPreferences }
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

export type CommunityRecord = { id: string; name: string; createdAt: string; updatedAt: string }
export type CommunityListResult =
  | { kind: "loaded"; communities: CommunityRecord[] }
  | { kind: "unavailable" | "error" }
export type CommunityMutationResult =
  | { kind: "updated"; community: CommunityRecord }
  | { kind: "unavailable" | "validation" | "forbidden" | "not_found" | "error" }

const MY_COMMUNITIES_QUERY = "query MyCommunities { myCommunities { id name createdAt updatedAt } }"
const CREATE_COMMUNITY_MUTATION = "mutation CreateCommunity($input: CreateCommunityInput!) { createCommunity(input: $input) { community { id name createdAt updatedAt } } }"

export async function listMyMemoriaCommunities(): Promise<CommunityListResult> {
  const response = await request<{ myCommunities: CommunityRecord[] }>(MY_COMMUNITIES_QUERY, "MyCommunities")
  if (response.kind !== "ok") return { kind: response.kind }
  if (response.result.errors?.length) return {
    kind: response.result.errors.some(e => e.extensions?.code === "UNAUTHENTICATED") ? "unavailable" : "error",
  }
  const communities = response.result.data?.myCommunities
  return Array.isArray(communities) ? { kind: "loaded", communities } : { kind: "error" }
}

export async function createMemoriaCommunity(name: string): Promise<CommunityMutationResult> {
  const response = await request<{ createCommunity: { community: CommunityRecord } }>(
    CREATE_COMMUNITY_MUTATION, "CreateCommunity", { input: { name } },
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const codes = response.result.errors?.map(e => e.extensions?.code) ?? []
  if (codes.length) return { kind: codes.includes("UNAUTHENTICATED") ? "unavailable" : codes.includes("VALIDATION") ? "validation" : "error" }
  const community = response.result.data?.createCommunity?.community
  return community ? { kind: "updated", community } : { kind: "error" }
}

const COMMUNITY_QUERY = "query CommunityDetails($communityId: ID!) { community(communityId: $communityId) { id name createdAt updatedAt } }"
const RENAME_COMMUNITY_MUTATION = "mutation RenameCommunity($input: RenameCommunityInput!) { renameCommunity(input: $input) { community { id name createdAt updatedAt } } }"

export type CommunityDetailsResult =
  | { kind: "loaded"; community: CommunityRecord }
  | { kind: "unavailable" | "not_found" | "error" }

export async function getMemoriaCommunity(communityId: string): Promise<CommunityDetailsResult> {
  const response = await request<{ community: CommunityRecord | null }>(
    COMMUNITY_QUERY, "CommunityDetails", { communityId },
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const codes = response.result.errors?.map((error) => error.extensions?.code) ?? []
  if (codes.length) return { kind: codes.includes("UNAUTHENTICATED") ? "unavailable" : codes.includes("NOT_FOUND") ? "not_found" : "error" }
  const community = response.result.data?.community
  return community ? { kind: "loaded", community } : { kind: "not_found" }
}

export async function renameMemoriaCommunity(communityId: string, name: string): Promise<CommunityMutationResult> {
  const response = await request<{ renameCommunity: { community: CommunityRecord } }>(
    RENAME_COMMUNITY_MUTATION, "RenameCommunity", { input: { communityId, name } },
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const codes = response.result.errors?.map((error) => error.extensions?.code) ?? []
  if (codes.length) return {
    kind: codes.includes("UNAUTHENTICATED") ? "unavailable" : codes.includes("VALIDATION") ? "validation"
      : codes.includes("NOT_FOUND") ? "not_found" : codes.includes("FORBIDDEN") ? "forbidden" : "error",
  }
  const community = response.result.data?.renameCommunity?.community
  return community ? { kind: "updated", community } : { kind: "error" }
}

export type CommunityParticipant = {
  userId: string
  nickname: string
  role: "admin" | "member"
  joinedAt: string
}
export type CommunityMembersResult =
  | { kind: "loaded"; members: CommunityParticipant[] }
  | { kind: "unavailable" | "not_found" | "error" }

const COMMUNITY_MEMBERS_QUERY =
  "query CommunityMembers($communityId: ID!) { communityMembers(communityId: $communityId) { userId nickname role joinedAt } }"

export async function getMemoriaCommunityMembers(communityId: string): Promise<CommunityMembersResult> {
  const response = await request<{ communityMembers: CommunityParticipant[] }>(
    COMMUNITY_MEMBERS_QUERY, "CommunityMembers", { communityId },
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const codes = response.result.errors?.map(e => e.extensions?.code) ?? []
  if (codes.length) return { kind: codes.includes("UNAUTHENTICATED") ? "unavailable" : codes.includes("NOT_FOUND") ? "not_found" : "error" }
  const members = response.result.data?.communityMembers
  return Array.isArray(members) ? { kind: "loaded", members } : { kind: "error" }
}

export type CommunityRoleChangeResult =
  | { kind: "updated" }
  | { kind: "unavailable" | "validation" | "forbidden" | "not_found" | "error" }

const CHANGE_COMMUNITY_MEMBER_ROLE_MUTATION =
  "mutation ChangeCommunityMemberRole($input: ChangeCommunityMemberRoleInput!) { changeCommunityMemberRole(input: $input) { success } }"

export async function changeMemoriaCommunityMemberRole(
  communityId: string,
  userId: string,
  role: "admin" | "member",
): Promise<CommunityRoleChangeResult> {
  const response = await request<{ changeCommunityMemberRole: { success: boolean } }>(
    CHANGE_COMMUNITY_MEMBER_ROLE_MUTATION, "ChangeCommunityMemberRole",
    { input: { communityId, userId, role } },
  )
  if (response.kind !== "ok") return { kind: response.kind }
  const codes = response.result.errors?.map((error) => error.extensions?.code) ?? []
  if (codes.length) return {
    kind: codes.includes("UNAUTHENTICATED") ? "unavailable"
      : codes.includes("VALIDATION") ? "validation"
      : codes.includes("FORBIDDEN") ? "forbidden"
      : codes.includes("NOT_FOUND") ? "not_found" : "error",
  }
  return response.result.data?.changeCommunityMemberRole?.success
    ? { kind: "updated" } : { kind: "error" }
}
