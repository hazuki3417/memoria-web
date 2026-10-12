/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never
    }
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  DateTime: { input: string; output: string }
  Int64: { input: number; output: number }
  Upload: { input: File; output: File }
}

export type Community = {
  __typename?: "Community"
  createdAt: Scalars["DateTime"]["output"]
  id: Scalars["ID"]["output"]
  name: Scalars["String"]["output"]
  updatedAt: Scalars["DateTime"]["output"]
}

export type CreateCommunityInput = {
  name: Scalars["String"]["input"]
}

export type CreateCommunityPayload = {
  __typename?: "CreateCommunityPayload"
  community: Community
}

export type Mutation = {
  __typename?: "Mutation"
  createCommunity: CreateCommunityPayload
  registerUser: RegisterUserPayload
  updateUserProfile: UpdateUserProfilePayload
}

export type MutationCreateCommunityArgs = {
  input: CreateCommunityInput
}

export type MutationRegisterUserArgs = {
  input: RegisterUserInput
}

export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput
}

export type PageInfo = {
  __typename?: "PageInfo"
  endCursor?: Maybe<Scalars["String"]["output"]>
  hasNextPage: Scalars["Boolean"]["output"]
  hasPrevPage: Scalars["Boolean"]["output"]
  startCursor?: Maybe<Scalars["String"]["output"]>
}

export type Query = {
  __typename?: "Query"
  me?: Maybe<User>
}

export type RegisterUserInput = {
  nickname: Scalars["String"]["input"]
}

export type RegisterUserPayload = {
  __typename?: "RegisterUserPayload"
  user: User
}

export type UpdateUserProfileInput = {
  nickname: Scalars["String"]["input"]
}

export type UpdateUserProfilePayload = {
  __typename?: "UpdateUserProfilePayload"
  user: User
}

export type User = {
  __typename?: "User"
  createdAt: Scalars["DateTime"]["output"]
  id: Scalars["ID"]["output"]
  profile: UserProfile
  updatedAt: Scalars["DateTime"]["output"]
}

export type UserProfile = {
  __typename?: "UserProfile"
  nickname: Scalars["String"]["output"]
}

export type RegisterUserInput = {
  nickname: string
}

export type UpdateUserProfileInput = {
  nickname: string
}

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>

export type CurrentUserQuery = {
  me: { id: string; profile: { nickname: string } } | null
}

export type RegisterUserMutationVariables = Exact<{
  input: RegisterUserInput
}>

export type RegisterUserMutation = {
  registerUser: { user: { id: string; profile: { nickname: string } } }
}

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput
}>

export type UpdateUserProfileMutation = {
  updateUserProfile: { user: { id: string; profile: { nickname: string } } }
}
