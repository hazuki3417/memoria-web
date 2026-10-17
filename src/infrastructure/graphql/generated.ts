/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  Int64: { input: number; output: number; }
  Upload: { input: File; output: File; }
};

export type AcceptCommunityDeletionInput = {
  communityId: Scalars['ID']['input'];
  revision: Scalars['String']['input'];
};

export type AcceptCommunityDeletionPayload = {
  __typename?: 'AcceptCommunityDeletionPayload';
  accepted: Scalars['Boolean']['output'];
};

export type ChangeCommunityMemberRoleInput = {
  communityId: Scalars['ID']['input'];
  role: CommunityMemberRole;
  userId: Scalars['ID']['input'];
};

export type ChangeCommunityMemberRolePayload = {
  __typename?: 'ChangeCommunityMemberRolePayload';
  success: Scalars['Boolean']['output'];
};

export type Community = {
  __typename?: 'Community';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CommunityDeletionSnapshot = {
  __typename?: 'CommunityDeletionSnapshot';
  communityId: Scalars['ID']['output'];
  managedMediaCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  revision: Scalars['String']['output'];
};

export type CommunityMember = {
  __typename?: 'CommunityMember';
  joinedAt: Scalars['DateTime']['output'];
  nickname: Scalars['String']['output'];
  role: CommunityMemberRole;
  userId: Scalars['ID']['output'];
};

export enum CommunityMemberRole {
  Admin = 'admin',
  Member = 'member'
}

export type CommunityMembershipMutationPayload = {
  __typename?: 'CommunityMembershipMutationPayload';
  success: Scalars['Boolean']['output'];
};

export type CreateCommunityInput = {
  name: Scalars['String']['input'];
};

export type CreateCommunityPayload = {
  __typename?: 'CreateCommunityPayload';
  community: Community;
};

export enum DateFormat {
  DdMmYyyy = 'DD_MM_YYYY',
  MmDdYyyy = 'MM_DD_YYYY',
  YyyyMmDd = 'YYYY_MM_DD'
}

export enum FileSizeUnit {
  Binary = 'BINARY',
  Decimal = 'DECIMAL'
}

export enum MediaThumbnailSize {
  Large = 'LARGE',
  Medium = 'MEDIUM',
  Small = 'SMALL'
}

export type Mutation = {
  __typename?: 'Mutation';
  acceptCommunityDeletion: AcceptCommunityDeletionPayload;
  changeCommunityMemberRole: ChangeCommunityMemberRolePayload;
  createCommunity: CreateCommunityPayload;
  leaveCommunity: CommunityMembershipMutationPayload;
  registerUser: RegisterUserPayload;
  removeCommunityMember: CommunityMembershipMutationPayload;
  renameCommunity: RenameCommunityPayload;
  updateUserPreferences: UpdateUserPreferencesPayload;
  updateUserProfile: UpdateUserProfilePayload;
};


export type MutationAcceptCommunityDeletionArgs = {
  input: AcceptCommunityDeletionInput;
};


export type MutationChangeCommunityMemberRoleArgs = {
  input: ChangeCommunityMemberRoleInput;
};


export type MutationCreateCommunityArgs = {
  input: CreateCommunityInput;
};


export type MutationLeaveCommunityArgs = {
  communityId: Scalars['ID']['input'];
};


export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
};


export type MutationRemoveCommunityMemberArgs = {
  input: RemoveCommunityMemberInput;
};


export type MutationRenameCommunityArgs = {
  input: RenameCommunityInput;
};


export type MutationUpdateUserPreferencesArgs = {
  input: UpdateUserPreferencesInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPrevPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  community?: Maybe<Community>;
  communityDeletionSnapshot: CommunityDeletionSnapshot;
  communityMembers: Array<CommunityMember>;
  me?: Maybe<User>;
  myCommunities: Array<Community>;
};


export type QueryCommunityArgs = {
  communityId: Scalars['ID']['input'];
};


export type QueryCommunityDeletionSnapshotArgs = {
  communityId: Scalars['ID']['input'];
};


export type QueryCommunityMembersArgs = {
  communityId: Scalars['ID']['input'];
};

export type RegisterUserInput = {
  nickname: Scalars['String']['input'];
};

export type RegisterUserPayload = {
  __typename?: 'RegisterUserPayload';
  user: User;
};

export type RemoveCommunityMemberInput = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type RenameCommunityInput = {
  communityId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type RenameCommunityPayload = {
  __typename?: 'RenameCommunityPayload';
  community: Community;
};

export type UpdateUserPreferencesInput = {
  dateFormat?: InputMaybe<DateFormat>;
  fileSizeUnit?: InputMaybe<FileSizeUnit>;
  mediaDetailInitialInfoMedium?: InputMaybe<Scalars['Boolean']['input']>;
  mediaDetailInitialInfoWide?: InputMaybe<Scalars['Boolean']['input']>;
  mediaDetailNavigationWrap?: InputMaybe<Scalars['Boolean']['input']>;
  mediaThumbnailSize?: InputMaybe<MediaThumbnailSize>;
  personalAccentColor?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserPreferencesPayload = {
  __typename?: 'UpdateUserPreferencesPayload';
  preferences: UserPreferences;
};

export type UpdateUserProfileInput = {
  nickname: Scalars['String']['input'];
};

export type UpdateUserProfilePayload = {
  __typename?: 'UpdateUserProfilePayload';
  user: User;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  preferences: UserPreferences;
  profile: UserProfile;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  dateFormat: DateFormat;
  fileSizeUnit: FileSizeUnit;
  mediaDetailInitialInfoMedium: Scalars['Boolean']['output'];
  mediaDetailInitialInfoWide: Scalars['Boolean']['output'];
  mediaDetailNavigationWrap: Scalars['Boolean']['output'];
  mediaThumbnailSize: MediaThumbnailSize;
  personalAccentColor: Scalars['String']['output'];
};

export type UserProfile = {
  __typename?: 'UserProfile';
  nickname: Scalars['String']['output'];
};

export type OperationAcceptCommunityDeletionInput = {
  communityId: string | number;
  revision: string;
};

export type OperationChangeCommunityMemberRoleInput = {
  communityId: string | number;
  role: OperationCommunityMemberRole;
  userId: string | number;
};

export type OperationCommunityMemberRole =
  | 'admin'
  | 'member';

export type OperationCreateCommunityInput = {
  name: string;
};

export type OperationDateFormat =
  | 'DD_MM_YYYY'
  | 'MM_DD_YYYY'
  | 'YYYY_MM_DD';

export type OperationFileSizeUnit =
  | 'BINARY'
  | 'DECIMAL';

export type OperationMediaThumbnailSize =
  | 'LARGE'
  | 'MEDIUM'
  | 'SMALL';

export type OperationRegisterUserInput = {
  nickname: string;
};

export type OperationRemoveCommunityMemberInput = {
  communityId: string | number;
  userId: string | number;
};

export type OperationRenameCommunityInput = {
  communityId: string | number;
  name: string;
};

export type OperationUpdateUserPreferencesInput = {
  dateFormat?: OperationDateFormat | null | undefined;
  fileSizeUnit?: OperationFileSizeUnit | null | undefined;
  mediaDetailInitialInfoMedium?: boolean | null | undefined;
  mediaDetailInitialInfoWide?: boolean | null | undefined;
  mediaDetailNavigationWrap?: boolean | null | undefined;
  mediaThumbnailSize?: OperationMediaThumbnailSize | null | undefined;
  personalAccentColor?: string | null | undefined;
};

export type OperationUpdateUserProfileInput = {
  nickname: string;
};

export type OperationMyCommunitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationMyCommunitiesQuery = { myCommunities: Array<{ id: string, name: string, createdAt: string, updatedAt: string }> };

export type OperationCommunityDetailsQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunityDetailsQuery = { community: { id: string, name: string, createdAt: string, updatedAt: string } | null };

export type OperationCommunityMembersQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunityMembersQuery = { communityMembers: Array<{ userId: string, nickname: string, role: OperationCommunityMemberRole, joinedAt: string }> };

export type OperationCommunityDeletionSnapshotQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunityDeletionSnapshotQuery = { communityDeletionSnapshot: { communityId: string, name: string, managedMediaCount: number, revision: string } };

export type OperationCreateCommunityMutationVariables = Exact<{
  input: OperationCreateCommunityInput;
}>;


export type OperationCreateCommunityMutation = { createCommunity: { community: { id: string, name: string, createdAt: string, updatedAt: string } } };

export type OperationRenameCommunityMutationVariables = Exact<{
  input: OperationRenameCommunityInput;
}>;


export type OperationRenameCommunityMutation = { renameCommunity: { community: { id: string, name: string, createdAt: string, updatedAt: string } } };

export type OperationChangeCommunityMemberRoleMutationVariables = Exact<{
  input: OperationChangeCommunityMemberRoleInput;
}>;


export type OperationChangeCommunityMemberRoleMutation = { changeCommunityMemberRole: { success: boolean } };

export type OperationRemoveCommunityMemberMutationVariables = Exact<{
  input: OperationRemoveCommunityMemberInput;
}>;


export type OperationRemoveCommunityMemberMutation = { removeCommunityMember: { success: boolean } };

export type OperationLeaveCommunityMutationVariables = Exact<{
  communityId: string | number;
}>;


export type OperationLeaveCommunityMutation = { leaveCommunity: { success: boolean } };

export type OperationAcceptCommunityDeletionMutationVariables = Exact<{
  input: OperationAcceptCommunityDeletionInput;
}>;


export type OperationAcceptCommunityDeletionMutation = { acceptCommunityDeletion: { accepted: boolean } };

export type OperationCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationCurrentUserQuery = { me: { id: string, profile: { nickname: string }, preferences: { personalAccentColor: string, dateFormat: OperationDateFormat, fileSizeUnit: OperationFileSizeUnit, mediaThumbnailSize: OperationMediaThumbnailSize, mediaDetailNavigationWrap: boolean, mediaDetailInitialInfoWide: boolean, mediaDetailInitialInfoMedium: boolean } } | null };

export type OperationRegisterMemoriaUserMutationVariables = Exact<{
  input: OperationRegisterUserInput;
}>;


export type OperationRegisterMemoriaUserMutation = { registerUser: { user: { id: string, profile: { nickname: string } } } };

export type OperationUpdateMemoriaUserProfileMutationVariables = Exact<{
  input: OperationUpdateUserProfileInput;
}>;


export type OperationUpdateMemoriaUserProfileMutation = { updateUserProfile: { user: { id: string, profile: { nickname: string } } } };

export type OperationSaveUserPreferencesMutationVariables = Exact<{
  input: OperationUpdateUserPreferencesInput;
}>;


export type OperationSaveUserPreferencesMutation = { updateUserPreferences: { preferences: { personalAccentColor: string, dateFormat: OperationDateFormat, fileSizeUnit: OperationFileSizeUnit, mediaThumbnailSize: OperationMediaThumbnailSize, mediaDetailNavigationWrap: boolean, mediaDetailInitialInfoWide: boolean, mediaDetailInitialInfoMedium: boolean } } };


export const MyCommunitiesDocument = gql`
    query MyCommunities {
  myCommunities {
    id
    name
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useMyCommunitiesQuery__
 *
 * To run a query within a React component, call `useMyCommunitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyCommunitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyCommunitiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyCommunitiesQuery(baseOptions?: Apollo.QueryHookOptions<MyCommunitiesQuery, MyCommunitiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyCommunitiesQuery, MyCommunitiesQueryVariables>(MyCommunitiesDocument, options);
      }
export function useMyCommunitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyCommunitiesQuery, MyCommunitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyCommunitiesQuery, MyCommunitiesQueryVariables>(MyCommunitiesDocument, options);
        }
// @ts-ignore
export function useMyCommunitiesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyCommunitiesQuery, MyCommunitiesQueryVariables>): Apollo.UseSuspenseQueryResult<MyCommunitiesQuery, MyCommunitiesQueryVariables>;
export function useMyCommunitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCommunitiesQuery, MyCommunitiesQueryVariables>): Apollo.UseSuspenseQueryResult<MyCommunitiesQuery | undefined, MyCommunitiesQueryVariables>;
export function useMyCommunitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCommunitiesQuery, MyCommunitiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyCommunitiesQuery, MyCommunitiesQueryVariables>(MyCommunitiesDocument, options);
        }
export type MyCommunitiesQueryHookResult = ReturnType<typeof useMyCommunitiesQuery>;
export type MyCommunitiesLazyQueryHookResult = ReturnType<typeof useMyCommunitiesLazyQuery>;
export type MyCommunitiesSuspenseQueryHookResult = ReturnType<typeof useMyCommunitiesSuspenseQuery>;
export type MyCommunitiesQueryResult = Apollo.QueryResult<MyCommunitiesQuery, MyCommunitiesQueryVariables>;
export const CommunityDetailsDocument = gql`
    query CommunityDetails($communityId: ID!) {
  community(communityId: $communityId) {
    id
    name
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useCommunityDetailsQuery__
 *
 * To run a query within a React component, call `useCommunityDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityDetailsQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityDetailsQuery(baseOptions: Apollo.QueryHookOptions<CommunityDetailsQuery, CommunityDetailsQueryVariables> & ({ variables: CommunityDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CommunityDetailsQuery, CommunityDetailsQueryVariables>(CommunityDetailsDocument, options);
      }
export function useCommunityDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CommunityDetailsQuery, CommunityDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CommunityDetailsQuery, CommunityDetailsQueryVariables>(CommunityDetailsDocument, options);
        }
// @ts-ignore
export function useCommunityDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CommunityDetailsQuery, CommunityDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<CommunityDetailsQuery, CommunityDetailsQueryVariables>;
export function useCommunityDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CommunityDetailsQuery, CommunityDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<CommunityDetailsQuery | undefined, CommunityDetailsQueryVariables>;
export function useCommunityDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CommunityDetailsQuery, CommunityDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CommunityDetailsQuery, CommunityDetailsQueryVariables>(CommunityDetailsDocument, options);
        }
export type CommunityDetailsQueryHookResult = ReturnType<typeof useCommunityDetailsQuery>;
export type CommunityDetailsLazyQueryHookResult = ReturnType<typeof useCommunityDetailsLazyQuery>;
export type CommunityDetailsSuspenseQueryHookResult = ReturnType<typeof useCommunityDetailsSuspenseQuery>;
export type CommunityDetailsQueryResult = Apollo.QueryResult<CommunityDetailsQuery, CommunityDetailsQueryVariables>;
export const CommunityMembersDocument = gql`
    query CommunityMembers($communityId: ID!) {
  communityMembers(communityId: $communityId) {
    userId
    nickname
    role
    joinedAt
  }
}
    `;

/**
 * __useCommunityMembersQuery__
 *
 * To run a query within a React component, call `useCommunityMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityMembersQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityMembersQuery(baseOptions: Apollo.QueryHookOptions<CommunityMembersQuery, CommunityMembersQueryVariables> & ({ variables: CommunityMembersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CommunityMembersQuery, CommunityMembersQueryVariables>(CommunityMembersDocument, options);
      }
export function useCommunityMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CommunityMembersQuery, CommunityMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CommunityMembersQuery, CommunityMembersQueryVariables>(CommunityMembersDocument, options);
        }
// @ts-ignore
export function useCommunityMembersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CommunityMembersQuery, CommunityMembersQueryVariables>): Apollo.UseSuspenseQueryResult<CommunityMembersQuery, CommunityMembersQueryVariables>;
export function useCommunityMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CommunityMembersQuery, CommunityMembersQueryVariables>): Apollo.UseSuspenseQueryResult<CommunityMembersQuery | undefined, CommunityMembersQueryVariables>;
export function useCommunityMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CommunityMembersQuery, CommunityMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CommunityMembersQuery, CommunityMembersQueryVariables>(CommunityMembersDocument, options);
        }
export type CommunityMembersQueryHookResult = ReturnType<typeof useCommunityMembersQuery>;
export type CommunityMembersLazyQueryHookResult = ReturnType<typeof useCommunityMembersLazyQuery>;
export type CommunityMembersSuspenseQueryHookResult = ReturnType<typeof useCommunityMembersSuspenseQuery>;
export type CommunityMembersQueryResult = Apollo.QueryResult<CommunityMembersQuery, CommunityMembersQueryVariables>;
export const CommunityDeletionSnapshotDocument = gql`
    query CommunityDeletionSnapshot($communityId: ID!) {
  communityDeletionSnapshot(communityId: $communityId) {
    communityId
    name
    managedMediaCount
    revision
  }
}
    `;

/**
 * __useCommunityDeletionSnapshotQuery__
 *
 * To run a query within a React component, call `useCommunityDeletionSnapshotQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityDeletionSnapshotQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityDeletionSnapshotQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityDeletionSnapshotQuery(baseOptions: Apollo.QueryHookOptions<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables> & ({ variables: CommunityDeletionSnapshotQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>(CommunityDeletionSnapshotDocument, options);
      }
export function useCommunityDeletionSnapshotLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>(CommunityDeletionSnapshotDocument, options);
        }
// @ts-ignore
export function useCommunityDeletionSnapshotSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>;
export function useCommunityDeletionSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<CommunityDeletionSnapshotQuery | undefined, CommunityDeletionSnapshotQueryVariables>;
export function useCommunityDeletionSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>(CommunityDeletionSnapshotDocument, options);
        }
export type CommunityDeletionSnapshotQueryHookResult = ReturnType<typeof useCommunityDeletionSnapshotQuery>;
export type CommunityDeletionSnapshotLazyQueryHookResult = ReturnType<typeof useCommunityDeletionSnapshotLazyQuery>;
export type CommunityDeletionSnapshotSuspenseQueryHookResult = ReturnType<typeof useCommunityDeletionSnapshotSuspenseQuery>;
export type CommunityDeletionSnapshotQueryResult = Apollo.QueryResult<CommunityDeletionSnapshotQuery, CommunityDeletionSnapshotQueryVariables>;
export const CreateCommunityDocument = gql`
    mutation CreateCommunity($input: CreateCommunityInput!) {
  createCommunity(input: $input) {
    community {
      id
      name
      createdAt
      updatedAt
    }
  }
}
    `;
export type CreateCommunityMutationFn = Apollo.MutationFunction<CreateCommunityMutation, CreateCommunityMutationVariables>;

/**
 * __useCreateCommunityMutation__
 *
 * To run a mutation, you first call `useCreateCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommunityMutation, { data, loading, error }] = useCreateCommunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommunityMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommunityMutation, CreateCommunityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommunityMutation, CreateCommunityMutationVariables>(CreateCommunityDocument, options);
      }
export type CreateCommunityMutationHookResult = ReturnType<typeof useCreateCommunityMutation>;
export type CreateCommunityMutationResult = Apollo.MutationResult<CreateCommunityMutation>;
export type CreateCommunityMutationOptions = Apollo.BaseMutationOptions<CreateCommunityMutation, CreateCommunityMutationVariables>;
export const RenameCommunityDocument = gql`
    mutation RenameCommunity($input: RenameCommunityInput!) {
  renameCommunity(input: $input) {
    community {
      id
      name
      createdAt
      updatedAt
    }
  }
}
    `;
export type RenameCommunityMutationFn = Apollo.MutationFunction<RenameCommunityMutation, RenameCommunityMutationVariables>;

/**
 * __useRenameCommunityMutation__
 *
 * To run a mutation, you first call `useRenameCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRenameCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [renameCommunityMutation, { data, loading, error }] = useRenameCommunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRenameCommunityMutation(baseOptions?: Apollo.MutationHookOptions<RenameCommunityMutation, RenameCommunityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RenameCommunityMutation, RenameCommunityMutationVariables>(RenameCommunityDocument, options);
      }
export type RenameCommunityMutationHookResult = ReturnType<typeof useRenameCommunityMutation>;
export type RenameCommunityMutationResult = Apollo.MutationResult<RenameCommunityMutation>;
export type RenameCommunityMutationOptions = Apollo.BaseMutationOptions<RenameCommunityMutation, RenameCommunityMutationVariables>;
export const ChangeCommunityMemberRoleDocument = gql`
    mutation ChangeCommunityMemberRole($input: ChangeCommunityMemberRoleInput!) {
  changeCommunityMemberRole(input: $input) {
    success
  }
}
    `;
export type ChangeCommunityMemberRoleMutationFn = Apollo.MutationFunction<ChangeCommunityMemberRoleMutation, ChangeCommunityMemberRoleMutationVariables>;

/**
 * __useChangeCommunityMemberRoleMutation__
 *
 * To run a mutation, you first call `useChangeCommunityMemberRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeCommunityMemberRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeCommunityMemberRoleMutation, { data, loading, error }] = useChangeCommunityMemberRoleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChangeCommunityMemberRoleMutation(baseOptions?: Apollo.MutationHookOptions<ChangeCommunityMemberRoleMutation, ChangeCommunityMemberRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeCommunityMemberRoleMutation, ChangeCommunityMemberRoleMutationVariables>(ChangeCommunityMemberRoleDocument, options);
      }
export type ChangeCommunityMemberRoleMutationHookResult = ReturnType<typeof useChangeCommunityMemberRoleMutation>;
export type ChangeCommunityMemberRoleMutationResult = Apollo.MutationResult<ChangeCommunityMemberRoleMutation>;
export type ChangeCommunityMemberRoleMutationOptions = Apollo.BaseMutationOptions<ChangeCommunityMemberRoleMutation, ChangeCommunityMemberRoleMutationVariables>;
export const RemoveCommunityMemberDocument = gql`
    mutation RemoveCommunityMember($input: RemoveCommunityMemberInput!) {
  removeCommunityMember(input: $input) {
    success
  }
}
    `;
export type RemoveCommunityMemberMutationFn = Apollo.MutationFunction<RemoveCommunityMemberMutation, RemoveCommunityMemberMutationVariables>;

/**
 * __useRemoveCommunityMemberMutation__
 *
 * To run a mutation, you first call `useRemoveCommunityMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCommunityMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCommunityMemberMutation, { data, loading, error }] = useRemoveCommunityMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveCommunityMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemoveCommunityMemberMutation, RemoveCommunityMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveCommunityMemberMutation, RemoveCommunityMemberMutationVariables>(RemoveCommunityMemberDocument, options);
      }
export type RemoveCommunityMemberMutationHookResult = ReturnType<typeof useRemoveCommunityMemberMutation>;
export type RemoveCommunityMemberMutationResult = Apollo.MutationResult<RemoveCommunityMemberMutation>;
export type RemoveCommunityMemberMutationOptions = Apollo.BaseMutationOptions<RemoveCommunityMemberMutation, RemoveCommunityMemberMutationVariables>;
export const LeaveCommunityDocument = gql`
    mutation LeaveCommunity($communityId: ID!) {
  leaveCommunity(communityId: $communityId) {
    success
  }
}
    `;
export type LeaveCommunityMutationFn = Apollo.MutationFunction<LeaveCommunityMutation, LeaveCommunityMutationVariables>;

/**
 * __useLeaveCommunityMutation__
 *
 * To run a mutation, you first call `useLeaveCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveCommunityMutation, { data, loading, error }] = useLeaveCommunityMutation({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useLeaveCommunityMutation(baseOptions?: Apollo.MutationHookOptions<LeaveCommunityMutation, LeaveCommunityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LeaveCommunityMutation, LeaveCommunityMutationVariables>(LeaveCommunityDocument, options);
      }
export type LeaveCommunityMutationHookResult = ReturnType<typeof useLeaveCommunityMutation>;
export type LeaveCommunityMutationResult = Apollo.MutationResult<LeaveCommunityMutation>;
export type LeaveCommunityMutationOptions = Apollo.BaseMutationOptions<LeaveCommunityMutation, LeaveCommunityMutationVariables>;
export const AcceptCommunityDeletionDocument = gql`
    mutation AcceptCommunityDeletion($input: AcceptCommunityDeletionInput!) {
  acceptCommunityDeletion(input: $input) {
    accepted
  }
}
    `;
export type AcceptCommunityDeletionMutationFn = Apollo.MutationFunction<AcceptCommunityDeletionMutation, AcceptCommunityDeletionMutationVariables>;

/**
 * __useAcceptCommunityDeletionMutation__
 *
 * To run a mutation, you first call `useAcceptCommunityDeletionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcceptCommunityDeletionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acceptCommunityDeletionMutation, { data, loading, error }] = useAcceptCommunityDeletionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAcceptCommunityDeletionMutation(baseOptions?: Apollo.MutationHookOptions<AcceptCommunityDeletionMutation, AcceptCommunityDeletionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcceptCommunityDeletionMutation, AcceptCommunityDeletionMutationVariables>(AcceptCommunityDeletionDocument, options);
      }
export type AcceptCommunityDeletionMutationHookResult = ReturnType<typeof useAcceptCommunityDeletionMutation>;
export type AcceptCommunityDeletionMutationResult = Apollo.MutationResult<AcceptCommunityDeletionMutation>;
export type AcceptCommunityDeletionMutationOptions = Apollo.BaseMutationOptions<AcceptCommunityDeletionMutation, AcceptCommunityDeletionMutationVariables>;
export const CurrentUserDocument = gql`
    query CurrentUser {
  me {
    id
    profile {
      nickname
    }
    preferences {
      personalAccentColor
      dateFormat
      fileSizeUnit
      mediaThumbnailSize
      mediaDetailNavigationWrap
      mediaDetailInitialInfoWide
      mediaDetailInitialInfoMedium
    }
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
// @ts-ignore
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<CurrentUserQuery | undefined, CurrentUserQueryVariables>;
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export const RegisterMemoriaUserDocument = gql`
    mutation RegisterMemoriaUser($input: RegisterUserInput!) {
  registerUser(input: $input) {
    user {
      id
      profile {
        nickname
      }
    }
  }
}
    `;
export type RegisterMemoriaUserMutationFn = Apollo.MutationFunction<RegisterMemoriaUserMutation, RegisterMemoriaUserMutationVariables>;

/**
 * __useRegisterMemoriaUserMutation__
 *
 * To run a mutation, you first call `useRegisterMemoriaUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMemoriaUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMemoriaUserMutation, { data, loading, error }] = useRegisterMemoriaUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterMemoriaUserMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMemoriaUserMutation, RegisterMemoriaUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMemoriaUserMutation, RegisterMemoriaUserMutationVariables>(RegisterMemoriaUserDocument, options);
      }
export type RegisterMemoriaUserMutationHookResult = ReturnType<typeof useRegisterMemoriaUserMutation>;
export type RegisterMemoriaUserMutationResult = Apollo.MutationResult<RegisterMemoriaUserMutation>;
export type RegisterMemoriaUserMutationOptions = Apollo.BaseMutationOptions<RegisterMemoriaUserMutation, RegisterMemoriaUserMutationVariables>;
export const UpdateMemoriaUserProfileDocument = gql`
    mutation UpdateMemoriaUserProfile($input: UpdateUserProfileInput!) {
  updateUserProfile(input: $input) {
    user {
      id
      profile {
        nickname
      }
    }
  }
}
    `;
export type UpdateMemoriaUserProfileMutationFn = Apollo.MutationFunction<UpdateMemoriaUserProfileMutation, UpdateMemoriaUserProfileMutationVariables>;

/**
 * __useUpdateMemoriaUserProfileMutation__
 *
 * To run a mutation, you first call `useUpdateMemoriaUserProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMemoriaUserProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMemoriaUserProfileMutation, { data, loading, error }] = useUpdateMemoriaUserProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMemoriaUserProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMemoriaUserProfileMutation, UpdateMemoriaUserProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMemoriaUserProfileMutation, UpdateMemoriaUserProfileMutationVariables>(UpdateMemoriaUserProfileDocument, options);
      }
export type UpdateMemoriaUserProfileMutationHookResult = ReturnType<typeof useUpdateMemoriaUserProfileMutation>;
export type UpdateMemoriaUserProfileMutationResult = Apollo.MutationResult<UpdateMemoriaUserProfileMutation>;
export type UpdateMemoriaUserProfileMutationOptions = Apollo.BaseMutationOptions<UpdateMemoriaUserProfileMutation, UpdateMemoriaUserProfileMutationVariables>;
export const SaveUserPreferencesDocument = gql`
    mutation SaveUserPreferences($input: UpdateUserPreferencesInput!) {
  updateUserPreferences(input: $input) {
    preferences {
      personalAccentColor
      dateFormat
      fileSizeUnit
      mediaThumbnailSize
      mediaDetailNavigationWrap
      mediaDetailInitialInfoWide
      mediaDetailInitialInfoMedium
    }
  }
}
    `;
export type SaveUserPreferencesMutationFn = Apollo.MutationFunction<SaveUserPreferencesMutation, SaveUserPreferencesMutationVariables>;

/**
 * __useSaveUserPreferencesMutation__
 *
 * To run a mutation, you first call `useSaveUserPreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveUserPreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveUserPreferencesMutation, { data, loading, error }] = useSaveUserPreferencesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSaveUserPreferencesMutation(baseOptions?: Apollo.MutationHookOptions<SaveUserPreferencesMutation, SaveUserPreferencesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveUserPreferencesMutation, SaveUserPreferencesMutationVariables>(SaveUserPreferencesDocument, options);
      }
export type SaveUserPreferencesMutationHookResult = ReturnType<typeof useSaveUserPreferencesMutation>;
export type SaveUserPreferencesMutationResult = Apollo.MutationResult<SaveUserPreferencesMutation>;
export type SaveUserPreferencesMutationOptions = Apollo.BaseMutationOptions<SaveUserPreferencesMutation, SaveUserPreferencesMutationVariables>;