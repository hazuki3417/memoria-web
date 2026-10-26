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
  Int64: { input: string; output: string; }
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

export enum BulkItemStatus {
  AlreadyApplied = 'ALREADY_APPLIED',
  Failed = 'FAILED',
  Succeeded = 'SUCCEEDED'
}

export type ChangeCommunityMemberRoleInput = {
  communityId: Scalars['ID']['input'];
  role: CommunityMemberRole;
  userId: Scalars['ID']['input'];
};

export type ChangeCommunityMemberRolePayload = {
  __typename?: 'ChangeCommunityMemberRolePayload';
  success: Scalars['Boolean']['output'];
};

export type ChangeMediaGroupClassificationInput = {
  groupId: Scalars['ID']['input'];
  mediaIds: Array<Scalars['ID']['input']>;
};

export type ChangeMediaGroupClassificationPayload = {
  __typename?: 'ChangeMediaGroupClassificationPayload';
  results: Array<MediaGroupClassificationItemResult>;
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

export type CommunityUsage = {
  __typename?: 'CommunityUsage';
  formatBreakdown: Array<MediaFormatUsage>;
  mediaCount: Scalars['Int']['output'];
  storage: StorageUsage;
};

export type CreateCommunityInput = {
  name: Scalars['String']['input'];
};

export type CreateCommunityPayload = {
  __typename?: 'CreateCommunityPayload';
  community: Community;
};

export type CreateMediaGroupInput = {
  childGroupIds: Array<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  parentGroupIds: Array<Scalars['ID']['input']>;
  scope: ScopeInput;
};

export enum DateFormat {
  DdMmYyyy = 'DD_MM_YYYY',
  MmDdYyyy = 'MM_DD_YYYY',
  YyyyMmDd = 'YYYY_MM_DD'
}

export type DeleteMediaGroupInput = {
  groupId: Scalars['ID']['input'];
};

export type DeleteMediaGroupPayload = {
  __typename?: 'DeleteMediaGroupPayload';
  groupId: Scalars['ID']['output'];
};

export enum FileSizeUnit {
  Binary = 'BINARY',
  Decimal = 'DECIMAL'
}

export type Image = {
  __typename?: 'Image';
  height: Scalars['Int']['output'];
  variants: Array<ImageVariant>;
  width: Scalars['Int']['output'];
};

export type ImageVariant = {
  __typename?: 'ImageVariant';
  format: Scalars['String']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  sizeBytes: Scalars['Int']['output'];
  url: Scalars['String']['output'];
  width: Scalars['Int']['output'];
};

export type Media = {
  __typename?: 'Media';
  createdAt: Scalars['DateTime']['output'];
  fileSize: Scalars['Int']['output'];
  groups: MediaGroupConnection;
  id: Scalars['ID']['output'];
  image?: Maybe<Image>;
  mediaType: MediaType;
  mimeType: Scalars['String']['output'];
  originalFileName: Scalars['String']['output'];
  processing?: Maybe<MediaProcessing>;
  status: MediaStatus;
  tags: MediaTagConnection;
  updatedAt: Scalars['DateTime']['output'];
  uploadedAt: Scalars['DateTime']['output'];
  uploadedBy?: Maybe<MediaUploader>;
};


export type MediaGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  scope: ScopeInput;
};


export type MediaTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  scope: ScopeInput;
};

export type MediaConnection = {
  __typename?: 'MediaConnection';
  edges: Array<MediaEdge>;
  pageInfo: PageInfo;
};

export type MediaEdge = {
  __typename?: 'MediaEdge';
  cursor: Scalars['String']['output'];
  node: Media;
};

export type MediaFilterInput = {
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type MediaFormatUsage = {
  __typename?: 'MediaFormatUsage';
  format: OriginalImageFormat;
  mediaCount: Scalars['Int']['output'];
  usedBytes: Scalars['Int64']['output'];
};

export type MediaGroup = {
  __typename?: 'MediaGroup';
  aggregateMedia: MediaConnection;
  children: MediaGroupConnection;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  media: MediaConnection;
  name: Scalars['String']['output'];
  parents: MediaGroupConnection;
  stateToken: Scalars['String']['output'];
};


export type MediaGroupAggregateMediaArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MediaGroupChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MediaGroupMediaArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MediaGroupParentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type MediaGroupClassificationItemResult = {
  __typename?: 'MediaGroupClassificationItemResult';
  errorCode?: Maybe<Scalars['String']['output']>;
  mediaId: Scalars['ID']['output'];
  status: BulkItemStatus;
};

export type MediaGroupConnection = {
  __typename?: 'MediaGroupConnection';
  edges: Array<MediaGroupEdge>;
  pageInfo: PageInfo;
};

export type MediaGroupEdge = {
  __typename?: 'MediaGroupEdge';
  cursor: Scalars['String']['output'];
  node: MediaGroup;
};

export type MediaGroupPayload = {
  __typename?: 'MediaGroupPayload';
  group: MediaGroup;
};

export type MediaGroupRelationActionAvailability = {
  __typename?: 'MediaGroupRelationActionAvailability';
  canAdd: Scalars['Boolean']['output'];
  unavailableReason?: Maybe<MediaGroupRelationUnavailableReason>;
};

export type MediaGroupRelationCandidate = {
  __typename?: 'MediaGroupRelationCandidate';
  addAsChild: MediaGroupRelationActionAvailability;
  addAsParent: MediaGroupRelationActionAvailability;
  group: MediaGroup;
  isChild: Scalars['Boolean']['output'];
  isParent: Scalars['Boolean']['output'];
};

export type MediaGroupRelationCandidateConnection = {
  __typename?: 'MediaGroupRelationCandidateConnection';
  edges: Array<MediaGroupRelationCandidateEdge>;
  pageInfo: PageInfo;
};

export type MediaGroupRelationCandidateEdge = {
  __typename?: 'MediaGroupRelationCandidateEdge';
  cursor: Scalars['String']['output'];
  node: MediaGroupRelationCandidate;
};

export enum MediaGroupRelationChangeAction {
  Add = 'ADD',
  Remove = 'REMOVE'
}

export type MediaGroupRelationChangeInput = {
  action: MediaGroupRelationChangeAction;
  direction: MediaGroupRelationDirection;
  groupId: Scalars['ID']['input'];
};

export type MediaGroupRelationChangeResult = {
  __typename?: 'MediaGroupRelationChangeResult';
  action: MediaGroupRelationChangeAction;
  direction: MediaGroupRelationDirection;
  errorCode?: Maybe<Scalars['String']['output']>;
  groupId: Scalars['ID']['output'];
  status: MediaGroupRelationChangeStatus;
  unavailableReason?: Maybe<MediaGroupRelationUnavailableReason>;
};

export enum MediaGroupRelationChangeStatus {
  AlreadyApplied = 'ALREADY_APPLIED',
  Failed = 'FAILED',
  Succeeded = 'SUCCEEDED'
}

export enum MediaGroupRelationDirection {
  Child = 'CHILD',
  Parent = 'PARENT'
}

export enum MediaGroupRelationUnavailableReason {
  AlreadyRelated = 'ALREADY_RELATED',
  ChildLimit = 'CHILD_LIMIT',
  Cycle = 'CYCLE',
  DepthLimit = 'DEPTH_LIMIT',
  OppositeRelation = 'OPPOSITE_RELATION',
  ParentLimit = 'PARENT_LIMIT',
  Self = 'SELF'
}

export enum MediaGroupSort {
  CreatedAtDesc = 'CREATED_AT_DESC',
  NameAsc = 'NAME_ASC'
}

export type MediaProcessing = {
  __typename?: 'MediaProcessing';
  status: ProcessingStatus;
};

export enum MediaStatus {
  Active = 'ACTIVE',
  Deleting = 'DELETING'
}

export type MediaTag = {
  __typename?: 'MediaTag';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type MediaTagConnection = {
  __typename?: 'MediaTagConnection';
  edges: Array<MediaTagEdge>;
  pageInfo: PageInfo;
};

export type MediaTagEdge = {
  __typename?: 'MediaTagEdge';
  cursor: Scalars['String']['output'];
  node: MediaTag;
};

export enum MediaThumbnailSize {
  Large = 'LARGE',
  Medium = 'MEDIUM',
  Small = 'SMALL'
}

export enum MediaType {
  Image = 'IMAGE',
  Video = 'VIDEO'
}

export type MediaUploader = {
  __typename?: 'MediaUploader';
  deleted: Scalars['Boolean']['output'];
  nickname?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptCommunityDeletion: AcceptCommunityDeletionPayload;
  addMediaToGroup: ChangeMediaGroupClassificationPayload;
  changeCommunityMemberRole: ChangeCommunityMemberRolePayload;
  createCommunity: CreateCommunityPayload;
  createMediaGroup: MediaGroupPayload;
  deleteMediaGroup: DeleteMediaGroupPayload;
  leaveCommunity: CommunityMembershipMutationPayload;
  registerUser: RegisterUserPayload;
  removeCommunityMember: CommunityMembershipMutationPayload;
  removeMediaFromGroup: ChangeMediaGroupClassificationPayload;
  renameCommunity: RenameCommunityPayload;
  updateMediaGroup: UpdateMediaGroupPayload;
  updateUserPreferences: UpdateUserPreferencesPayload;
  updateUserProfile: UpdateUserProfilePayload;
};


export type MutationAcceptCommunityDeletionArgs = {
  input: AcceptCommunityDeletionInput;
};


export type MutationAddMediaToGroupArgs = {
  input: ChangeMediaGroupClassificationInput;
};


export type MutationChangeCommunityMemberRoleArgs = {
  input: ChangeCommunityMemberRoleInput;
};


export type MutationCreateCommunityArgs = {
  input: CreateCommunityInput;
};


export type MutationCreateMediaGroupArgs = {
  input: CreateMediaGroupInput;
};


export type MutationDeleteMediaGroupArgs = {
  input: DeleteMediaGroupInput;
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


export type MutationRemoveMediaFromGroupArgs = {
  input: ChangeMediaGroupClassificationInput;
};


export type MutationRenameCommunityArgs = {
  input: RenameCommunityInput;
};


export type MutationUpdateMediaGroupArgs = {
  input: UpdateMediaGroupInput;
};


export type MutationUpdateUserPreferencesArgs = {
  input: UpdateUserPreferencesInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};

export enum OriginalImageFormat {
  Heif = 'HEIF',
  Jpeg = 'JPEG',
  Png = 'PNG',
  Webp = 'WEBP'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum ProcessingStatus {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Ready = 'READY'
}

export type Query = {
  __typename?: 'Query';
  community?: Maybe<Community>;
  communityDeletionSnapshot: CommunityDeletionSnapshot;
  communityMembers: Array<CommunityMember>;
  communityUsage: CommunityUsage;
  me?: Maybe<User>;
  media?: Maybe<Media>;
  mediaGroup?: Maybe<MediaGroup>;
  mediaGroupRelationCandidates: MediaGroupRelationCandidateConnection;
  mediaGroups: MediaGroupConnection;
  mediaList: MediaConnection;
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


export type QueryCommunityUsageArgs = {
  communityId: Scalars['ID']['input'];
};


export type QueryMediaArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMediaGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMediaGroupRelationCandidatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  groupId: Scalars['ID']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMediaGroupsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  scope: ScopeInput;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: MediaGroupSort;
};


export type QueryMediaListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<MediaFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  scope: ScopeInput;
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

export type ScopeInput = {
  communityId?: InputMaybe<Scalars['ID']['input']>;
  type: ScopeType;
};

export enum ScopeType {
  Community = 'COMMUNITY',
  Personal = 'PERSONAL'
}

export type StorageUsage = {
  __typename?: 'StorageUsage';
  effectiveLimitBytes: Scalars['Int64']['output'];
  usedBytes: Scalars['Int64']['output'];
};

export type UpdateMediaGroupInput = {
  childGroupIds: Array<Scalars['ID']['input']>;
  expectedStateToken: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  parentGroupIds: Array<Scalars['ID']['input']>;
};

export type UpdateMediaGroupPayload = {
  __typename?: 'UpdateMediaGroupPayload';
  group: MediaGroup;
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
  usage: UserUsage;
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

export type UserUsage = {
  __typename?: 'UserUsage';
  formatBreakdown: Array<MediaFormatUsage>;
  mediaCount: Scalars['Int']['output'];
  storage: StorageUsage;
};

export type OperationAcceptCommunityDeletionInput = {
  communityId: string | number;
  revision: string;
};

export type OperationBulkItemStatus =
  | 'ALREADY_APPLIED'
  | 'FAILED'
  | 'SUCCEEDED';

export type OperationChangeCommunityMemberRoleInput = {
  communityId: string | number;
  role: OperationCommunityMemberRole;
  userId: string | number;
};

export type OperationChangeMediaGroupClassificationInput = {
  groupId: string | number;
  mediaIds: Array<string | number>;
};

export type OperationCommunityMemberRole =
  | 'admin'
  | 'member';

export type OperationCreateCommunityInput = {
  name: string;
};

export type OperationCreateMediaGroupInput = {
  childGroupIds: Array<string | number>;
  name: string;
  parentGroupIds: Array<string | number>;
  scope: OperationScopeInput;
};

export type OperationDateFormat =
  | 'DD_MM_YYYY'
  | 'MM_DD_YYYY'
  | 'YYYY_MM_DD';

export type OperationDeleteMediaGroupInput = {
  groupId: string | number;
};

export type OperationFileSizeUnit =
  | 'BINARY'
  | 'DECIMAL';

export type OperationMediaGroupRelationUnavailableReason =
  | 'ALREADY_RELATED'
  | 'CHILD_LIMIT'
  | 'CYCLE'
  | 'DEPTH_LIMIT'
  | 'OPPOSITE_RELATION'
  | 'PARENT_LIMIT'
  | 'SELF';

export type OperationMediaGroupSort =
  | 'CREATED_AT_DESC'
  | 'NAME_ASC';

export type OperationMediaStatus =
  | 'ACTIVE'
  | 'DELETING';

export type OperationMediaThumbnailSize =
  | 'LARGE'
  | 'MEDIUM'
  | 'SMALL';

export type OperationMediaType =
  | 'IMAGE'
  | 'VIDEO';

export type OperationOriginalImageFormat =
  | 'HEIF'
  | 'JPEG'
  | 'PNG'
  | 'WEBP';

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

export type OperationScopeInput = {
  communityId?: string | number | null | undefined;
  type: OperationScopeType;
};

export type OperationScopeType =
  | 'COMMUNITY'
  | 'PERSONAL';

export type OperationUpdateMediaGroupInput = {
  childGroupIds: Array<string | number>;
  expectedStateToken: string;
  groupId: string | number;
  name: string;
  parentGroupIds: Array<string | number>;
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

export type OperationCommunityUsageQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunityUsageQuery = { communityUsage: { mediaCount: number, storage: { usedBytes: string, effectiveLimitBytes: string }, formatBreakdown: Array<{ format: OperationOriginalImageFormat, mediaCount: number, usedBytes: string }> } };

export type OperationGroupBrowserGroupFragment = { id: string, name: string, stateToken: string, createdAt: string };

export type OperationBrowseGroupsQueryVariables = Exact<{
  scope: OperationScopeInput;
  search?: string | null | undefined;
  sort?: OperationMediaGroupSort;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type OperationBrowseGroupsQuery = { mediaGroups: { edges: Array<{ cursor: string, node: { id: string, name: string, stateToken: string, createdAt: string } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type OperationBrowseGroupDetailQueryVariables = Exact<{
  id: string | number;
  scope: OperationScopeInput;
  mediaAfter?: string | null | undefined;
}>;


export type OperationBrowseGroupDetailQuery = { mediaGroup: { id: string, name: string, stateToken: string, createdAt: string, parents: { edges: Array<{ node: { id: string, name: string } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null } }, children: { edges: Array<{ node: { id: string, name: string } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null } }, aggregateMedia: { edges: Array<{ cursor: string, node: { id: string, mediaType: OperationMediaType, status: OperationMediaStatus, originalFileName: string, createdAt: string, image: { variants: Array<{ url: string }> } | null, groups: { edges: Array<{ node: { id: string, name: string } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null } } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } } | null };

export type OperationBrowseGroupRelationCandidatesQueryVariables = Exact<{
  groupId: string | number;
  search?: string | null | undefined;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type OperationBrowseGroupRelationCandidatesQuery = { mediaGroupRelationCandidates: { edges: Array<{ cursor: string, node: { isParent: boolean, isChild: boolean, group: { id: string, name: string }, addAsParent: { canAdd: boolean, unavailableReason: OperationMediaGroupRelationUnavailableReason | null }, addAsChild: { canAdd: boolean, unavailableReason: OperationMediaGroupRelationUnavailableReason | null } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null } } };

export type OperationCreateBrowserGroupMutationVariables = Exact<{
  input: OperationCreateMediaGroupInput;
}>;


export type OperationCreateBrowserGroupMutation = { createMediaGroup: { group: { id: string, name: string, stateToken: string, createdAt: string } } };

export type OperationUpdateBrowserGroupMutationVariables = Exact<{
  input: OperationUpdateMediaGroupInput;
}>;


export type OperationUpdateBrowserGroupMutation = { updateMediaGroup: { group: { id: string, name: string, stateToken: string, createdAt: string } } };

export type OperationDeleteBrowserGroupMutationVariables = Exact<{
  input: OperationDeleteMediaGroupInput;
}>;


export type OperationDeleteBrowserGroupMutation = { deleteMediaGroup: { groupId: string } };

export type OperationAddBrowserMediaToGroupMutationVariables = Exact<{
  input: OperationChangeMediaGroupClassificationInput;
}>;


export type OperationAddBrowserMediaToGroupMutation = { addMediaToGroup: { results: Array<{ mediaId: string, status: OperationBulkItemStatus, errorCode: string | null }> } };

export type OperationRemoveBrowserMediaFromGroupMutationVariables = Exact<{
  input: OperationChangeMediaGroupClassificationInput;
}>;


export type OperationRemoveBrowserMediaFromGroupMutation = { removeMediaFromGroup: { results: Array<{ mediaId: string, status: OperationBulkItemStatus, errorCode: string | null }> } };

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

export type OperationPersonalUsageQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationPersonalUsageQuery = { me: { id: string, preferences: { fileSizeUnit: OperationFileSizeUnit }, usage: { mediaCount: number, storage: { usedBytes: string, effectiveLimitBytes: string }, formatBreakdown: Array<{ format: OperationOriginalImageFormat, mediaCount: number, usedBytes: string }> } } | null };

export const GroupBrowserGroupFragmentDoc = gql`
    fragment GroupBrowserGroup on MediaGroup {
  id
  name
  stateToken
  createdAt
}
    `;
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
export function useMyCommunitiesQuery(baseOptions?: Apollo.QueryHookOptions<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>(MyCommunitiesDocument, options);
      }
export function useMyCommunitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>(MyCommunitiesDocument, options);
        }
// @ts-ignore
export function useMyCommunitiesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>): Apollo.UseSuspenseQueryResult<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>;
export function useMyCommunitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>): Apollo.UseSuspenseQueryResult<OperationMyCommunitiesQuery | undefined, OperationMyCommunitiesQueryVariables>;
export function useMyCommunitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>(MyCommunitiesDocument, options);
        }
export type MyCommunitiesQueryHookResult = ReturnType<typeof useMyCommunitiesQuery>;
export type MyCommunitiesLazyQueryHookResult = ReturnType<typeof useMyCommunitiesLazyQuery>;
export type MyCommunitiesSuspenseQueryHookResult = ReturnType<typeof useMyCommunitiesSuspenseQuery>;
export type MyCommunitiesQueryResult = Apollo.QueryResult<OperationMyCommunitiesQuery, OperationMyCommunitiesQueryVariables>;
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
export function useCommunityDetailsQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables> & ({ variables: OperationCommunityDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>(CommunityDetailsDocument, options);
      }
export function useCommunityDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>(CommunityDetailsDocument, options);
        }
// @ts-ignore
export function useCommunityDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>;
export function useCommunityDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityDetailsQuery | undefined, OperationCommunityDetailsQueryVariables>;
export function useCommunityDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>(CommunityDetailsDocument, options);
        }
export type CommunityDetailsQueryHookResult = ReturnType<typeof useCommunityDetailsQuery>;
export type CommunityDetailsLazyQueryHookResult = ReturnType<typeof useCommunityDetailsLazyQuery>;
export type CommunityDetailsSuspenseQueryHookResult = ReturnType<typeof useCommunityDetailsSuspenseQuery>;
export type CommunityDetailsQueryResult = Apollo.QueryResult<OperationCommunityDetailsQuery, OperationCommunityDetailsQueryVariables>;
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
export function useCommunityMembersQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables> & ({ variables: OperationCommunityMembersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>(CommunityMembersDocument, options);
      }
export function useCommunityMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>(CommunityMembersDocument, options);
        }
// @ts-ignore
export function useCommunityMembersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>;
export function useCommunityMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityMembersQuery | undefined, OperationCommunityMembersQueryVariables>;
export function useCommunityMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>(CommunityMembersDocument, options);
        }
export type CommunityMembersQueryHookResult = ReturnType<typeof useCommunityMembersQuery>;
export type CommunityMembersLazyQueryHookResult = ReturnType<typeof useCommunityMembersLazyQuery>;
export type CommunityMembersSuspenseQueryHookResult = ReturnType<typeof useCommunityMembersSuspenseQuery>;
export type CommunityMembersQueryResult = Apollo.QueryResult<OperationCommunityMembersQuery, OperationCommunityMembersQueryVariables>;
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
export function useCommunityDeletionSnapshotQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables> & ({ variables: OperationCommunityDeletionSnapshotQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>(CommunityDeletionSnapshotDocument, options);
      }
export function useCommunityDeletionSnapshotLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>(CommunityDeletionSnapshotDocument, options);
        }
// @ts-ignore
export function useCommunityDeletionSnapshotSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>;
export function useCommunityDeletionSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityDeletionSnapshotQuery | undefined, OperationCommunityDeletionSnapshotQueryVariables>;
export function useCommunityDeletionSnapshotSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>(CommunityDeletionSnapshotDocument, options);
        }
export type CommunityDeletionSnapshotQueryHookResult = ReturnType<typeof useCommunityDeletionSnapshotQuery>;
export type CommunityDeletionSnapshotLazyQueryHookResult = ReturnType<typeof useCommunityDeletionSnapshotLazyQuery>;
export type CommunityDeletionSnapshotSuspenseQueryHookResult = ReturnType<typeof useCommunityDeletionSnapshotSuspenseQuery>;
export type CommunityDeletionSnapshotQueryResult = Apollo.QueryResult<OperationCommunityDeletionSnapshotQuery, OperationCommunityDeletionSnapshotQueryVariables>;
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
export type CreateCommunityMutationFn = Apollo.MutationFunction<OperationCreateCommunityMutation, OperationCreateCommunityMutationVariables>;

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
export function useCreateCommunityMutation(baseOptions?: Apollo.MutationHookOptions<OperationCreateCommunityMutation, OperationCreateCommunityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationCreateCommunityMutation, OperationCreateCommunityMutationVariables>(CreateCommunityDocument, options);
      }
export type CreateCommunityMutationHookResult = ReturnType<typeof useCreateCommunityMutation>;
export type CreateCommunityMutationResult = Apollo.MutationResult<OperationCreateCommunityMutation>;
export type CreateCommunityMutationOptions = Apollo.BaseMutationOptions<OperationCreateCommunityMutation, OperationCreateCommunityMutationVariables>;
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
export type RenameCommunityMutationFn = Apollo.MutationFunction<OperationRenameCommunityMutation, OperationRenameCommunityMutationVariables>;

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
export function useRenameCommunityMutation(baseOptions?: Apollo.MutationHookOptions<OperationRenameCommunityMutation, OperationRenameCommunityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationRenameCommunityMutation, OperationRenameCommunityMutationVariables>(RenameCommunityDocument, options);
      }
export type RenameCommunityMutationHookResult = ReturnType<typeof useRenameCommunityMutation>;
export type RenameCommunityMutationResult = Apollo.MutationResult<OperationRenameCommunityMutation>;
export type RenameCommunityMutationOptions = Apollo.BaseMutationOptions<OperationRenameCommunityMutation, OperationRenameCommunityMutationVariables>;
export const ChangeCommunityMemberRoleDocument = gql`
    mutation ChangeCommunityMemberRole($input: ChangeCommunityMemberRoleInput!) {
  changeCommunityMemberRole(input: $input) {
    success
  }
}
    `;
export type ChangeCommunityMemberRoleMutationFn = Apollo.MutationFunction<OperationChangeCommunityMemberRoleMutation, OperationChangeCommunityMemberRoleMutationVariables>;

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
export function useChangeCommunityMemberRoleMutation(baseOptions?: Apollo.MutationHookOptions<OperationChangeCommunityMemberRoleMutation, OperationChangeCommunityMemberRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationChangeCommunityMemberRoleMutation, OperationChangeCommunityMemberRoleMutationVariables>(ChangeCommunityMemberRoleDocument, options);
      }
export type ChangeCommunityMemberRoleMutationHookResult = ReturnType<typeof useChangeCommunityMemberRoleMutation>;
export type ChangeCommunityMemberRoleMutationResult = Apollo.MutationResult<OperationChangeCommunityMemberRoleMutation>;
export type ChangeCommunityMemberRoleMutationOptions = Apollo.BaseMutationOptions<OperationChangeCommunityMemberRoleMutation, OperationChangeCommunityMemberRoleMutationVariables>;
export const RemoveCommunityMemberDocument = gql`
    mutation RemoveCommunityMember($input: RemoveCommunityMemberInput!) {
  removeCommunityMember(input: $input) {
    success
  }
}
    `;
export type RemoveCommunityMemberMutationFn = Apollo.MutationFunction<OperationRemoveCommunityMemberMutation, OperationRemoveCommunityMemberMutationVariables>;

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
export function useRemoveCommunityMemberMutation(baseOptions?: Apollo.MutationHookOptions<OperationRemoveCommunityMemberMutation, OperationRemoveCommunityMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationRemoveCommunityMemberMutation, OperationRemoveCommunityMemberMutationVariables>(RemoveCommunityMemberDocument, options);
      }
export type RemoveCommunityMemberMutationHookResult = ReturnType<typeof useRemoveCommunityMemberMutation>;
export type RemoveCommunityMemberMutationResult = Apollo.MutationResult<OperationRemoveCommunityMemberMutation>;
export type RemoveCommunityMemberMutationOptions = Apollo.BaseMutationOptions<OperationRemoveCommunityMemberMutation, OperationRemoveCommunityMemberMutationVariables>;
export const LeaveCommunityDocument = gql`
    mutation LeaveCommunity($communityId: ID!) {
  leaveCommunity(communityId: $communityId) {
    success
  }
}
    `;
export type LeaveCommunityMutationFn = Apollo.MutationFunction<OperationLeaveCommunityMutation, OperationLeaveCommunityMutationVariables>;

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
export function useLeaveCommunityMutation(baseOptions?: Apollo.MutationHookOptions<OperationLeaveCommunityMutation, OperationLeaveCommunityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationLeaveCommunityMutation, OperationLeaveCommunityMutationVariables>(LeaveCommunityDocument, options);
      }
export type LeaveCommunityMutationHookResult = ReturnType<typeof useLeaveCommunityMutation>;
export type LeaveCommunityMutationResult = Apollo.MutationResult<OperationLeaveCommunityMutation>;
export type LeaveCommunityMutationOptions = Apollo.BaseMutationOptions<OperationLeaveCommunityMutation, OperationLeaveCommunityMutationVariables>;
export const AcceptCommunityDeletionDocument = gql`
    mutation AcceptCommunityDeletion($input: AcceptCommunityDeletionInput!) {
  acceptCommunityDeletion(input: $input) {
    accepted
  }
}
    `;
export type AcceptCommunityDeletionMutationFn = Apollo.MutationFunction<OperationAcceptCommunityDeletionMutation, OperationAcceptCommunityDeletionMutationVariables>;

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
export function useAcceptCommunityDeletionMutation(baseOptions?: Apollo.MutationHookOptions<OperationAcceptCommunityDeletionMutation, OperationAcceptCommunityDeletionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationAcceptCommunityDeletionMutation, OperationAcceptCommunityDeletionMutationVariables>(AcceptCommunityDeletionDocument, options);
      }
export type AcceptCommunityDeletionMutationHookResult = ReturnType<typeof useAcceptCommunityDeletionMutation>;
export type AcceptCommunityDeletionMutationResult = Apollo.MutationResult<OperationAcceptCommunityDeletionMutation>;
export type AcceptCommunityDeletionMutationOptions = Apollo.BaseMutationOptions<OperationAcceptCommunityDeletionMutation, OperationAcceptCommunityDeletionMutationVariables>;
export const CommunityUsageDocument = gql`
    query CommunityUsage($communityId: ID!) {
  communityUsage(communityId: $communityId) {
    mediaCount
    storage {
      usedBytes
      effectiveLimitBytes
    }
    formatBreakdown {
      format
      mediaCount
      usedBytes
    }
  }
}
    `;

/**
 * __useCommunityUsageQuery__
 *
 * To run a query within a React component, call `useCommunityUsageQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityUsageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityUsageQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityUsageQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables> & ({ variables: OperationCommunityUsageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>(CommunityUsageDocument, options);
      }
export function useCommunityUsageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>(CommunityUsageDocument, options);
        }
// @ts-ignore
export function useCommunityUsageSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>;
export function useCommunityUsageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityUsageQuery | undefined, OperationCommunityUsageQueryVariables>;
export function useCommunityUsageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>(CommunityUsageDocument, options);
        }
export type CommunityUsageQueryHookResult = ReturnType<typeof useCommunityUsageQuery>;
export type CommunityUsageLazyQueryHookResult = ReturnType<typeof useCommunityUsageLazyQuery>;
export type CommunityUsageSuspenseQueryHookResult = ReturnType<typeof useCommunityUsageSuspenseQuery>;
export type CommunityUsageQueryResult = Apollo.QueryResult<OperationCommunityUsageQuery, OperationCommunityUsageQueryVariables>;
export const BrowseGroupsDocument = gql`
    query BrowseGroups($scope: ScopeInput!, $search: String, $sort: MediaGroupSort! = NAME_ASC, $first: Int, $after: String) {
  mediaGroups(
    scope: $scope
    search: $search
    sort: $sort
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        ...GroupBrowserGroup
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    ${GroupBrowserGroupFragmentDoc}`;

/**
 * __useBrowseGroupsQuery__
 *
 * To run a query within a React component, call `useBrowseGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBrowseGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBrowseGroupsQuery({
 *   variables: {
 *      scope: // value for 'scope'
 *      search: // value for 'search'
 *      sort: // value for 'sort'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useBrowseGroupsQuery(baseOptions: Apollo.QueryHookOptions<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables> & ({ variables: OperationBrowseGroupsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>(BrowseGroupsDocument, options);
      }
export function useBrowseGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>(BrowseGroupsDocument, options);
        }
// @ts-ignore
export function useBrowseGroupsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>;
export function useBrowseGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationBrowseGroupsQuery | undefined, OperationBrowseGroupsQueryVariables>;
export function useBrowseGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>(BrowseGroupsDocument, options);
        }
export type BrowseGroupsQueryHookResult = ReturnType<typeof useBrowseGroupsQuery>;
export type BrowseGroupsLazyQueryHookResult = ReturnType<typeof useBrowseGroupsLazyQuery>;
export type BrowseGroupsSuspenseQueryHookResult = ReturnType<typeof useBrowseGroupsSuspenseQuery>;
export type BrowseGroupsQueryResult = Apollo.QueryResult<OperationBrowseGroupsQuery, OperationBrowseGroupsQueryVariables>;
export const BrowseGroupDetailDocument = gql`
    query BrowseGroupDetail($id: ID!, $scope: ScopeInput!, $mediaAfter: String) {
  mediaGroup(id: $id) {
    ...GroupBrowserGroup
    parents(first: 100) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    children(first: 100) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    aggregateMedia(first: 100, after: $mediaAfter) {
      edges {
        cursor
        node {
          id
          mediaType
          status
          originalFileName
          createdAt
          image {
            variants {
              url
            }
          }
          groups(scope: $scope, first: 100) {
            edges {
              node {
                id
                name
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
}
    ${GroupBrowserGroupFragmentDoc}`;

/**
 * __useBrowseGroupDetailQuery__
 *
 * To run a query within a React component, call `useBrowseGroupDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useBrowseGroupDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBrowseGroupDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *      scope: // value for 'scope'
 *      mediaAfter: // value for 'mediaAfter'
 *   },
 * });
 */
export function useBrowseGroupDetailQuery(baseOptions: Apollo.QueryHookOptions<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables> & ({ variables: OperationBrowseGroupDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>(BrowseGroupDetailDocument, options);
      }
export function useBrowseGroupDetailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>(BrowseGroupDetailDocument, options);
        }
// @ts-ignore
export function useBrowseGroupDetailSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>): Apollo.UseSuspenseQueryResult<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>;
export function useBrowseGroupDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>): Apollo.UseSuspenseQueryResult<OperationBrowseGroupDetailQuery | undefined, OperationBrowseGroupDetailQueryVariables>;
export function useBrowseGroupDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>(BrowseGroupDetailDocument, options);
        }
export type BrowseGroupDetailQueryHookResult = ReturnType<typeof useBrowseGroupDetailQuery>;
export type BrowseGroupDetailLazyQueryHookResult = ReturnType<typeof useBrowseGroupDetailLazyQuery>;
export type BrowseGroupDetailSuspenseQueryHookResult = ReturnType<typeof useBrowseGroupDetailSuspenseQuery>;
export type BrowseGroupDetailQueryResult = Apollo.QueryResult<OperationBrowseGroupDetailQuery, OperationBrowseGroupDetailQueryVariables>;
export const BrowseGroupRelationCandidatesDocument = gql`
    query BrowseGroupRelationCandidates($groupId: ID!, $search: String, $first: Int, $after: String) {
  mediaGroupRelationCandidates(
    groupId: $groupId
    search: $search
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        group {
          id
          name
        }
        isParent
        isChild
        addAsParent {
          canAdd
          unavailableReason
        }
        addAsChild {
          canAdd
          unavailableReason
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useBrowseGroupRelationCandidatesQuery__
 *
 * To run a query within a React component, call `useBrowseGroupRelationCandidatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useBrowseGroupRelationCandidatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBrowseGroupRelationCandidatesQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      search: // value for 'search'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useBrowseGroupRelationCandidatesQuery(baseOptions: Apollo.QueryHookOptions<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables> & ({ variables: OperationBrowseGroupRelationCandidatesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>(BrowseGroupRelationCandidatesDocument, options);
      }
export function useBrowseGroupRelationCandidatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>(BrowseGroupRelationCandidatesDocument, options);
        }
// @ts-ignore
export function useBrowseGroupRelationCandidatesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>): Apollo.UseSuspenseQueryResult<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>;
export function useBrowseGroupRelationCandidatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>): Apollo.UseSuspenseQueryResult<OperationBrowseGroupRelationCandidatesQuery | undefined, OperationBrowseGroupRelationCandidatesQueryVariables>;
export function useBrowseGroupRelationCandidatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>(BrowseGroupRelationCandidatesDocument, options);
        }
export type BrowseGroupRelationCandidatesQueryHookResult = ReturnType<typeof useBrowseGroupRelationCandidatesQuery>;
export type BrowseGroupRelationCandidatesLazyQueryHookResult = ReturnType<typeof useBrowseGroupRelationCandidatesLazyQuery>;
export type BrowseGroupRelationCandidatesSuspenseQueryHookResult = ReturnType<typeof useBrowseGroupRelationCandidatesSuspenseQuery>;
export type BrowseGroupRelationCandidatesQueryResult = Apollo.QueryResult<OperationBrowseGroupRelationCandidatesQuery, OperationBrowseGroupRelationCandidatesQueryVariables>;
export const CreateBrowserGroupDocument = gql`
    mutation CreateBrowserGroup($input: CreateMediaGroupInput!) {
  createMediaGroup(input: $input) {
    group {
      ...GroupBrowserGroup
    }
  }
}
    ${GroupBrowserGroupFragmentDoc}`;
export type CreateBrowserGroupMutationFn = Apollo.MutationFunction<OperationCreateBrowserGroupMutation, OperationCreateBrowserGroupMutationVariables>;

/**
 * __useCreateBrowserGroupMutation__
 *
 * To run a mutation, you first call `useCreateBrowserGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBrowserGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBrowserGroupMutation, { data, loading, error }] = useCreateBrowserGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateBrowserGroupMutation(baseOptions?: Apollo.MutationHookOptions<OperationCreateBrowserGroupMutation, OperationCreateBrowserGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationCreateBrowserGroupMutation, OperationCreateBrowserGroupMutationVariables>(CreateBrowserGroupDocument, options);
      }
export type CreateBrowserGroupMutationHookResult = ReturnType<typeof useCreateBrowserGroupMutation>;
export type CreateBrowserGroupMutationResult = Apollo.MutationResult<OperationCreateBrowserGroupMutation>;
export type CreateBrowserGroupMutationOptions = Apollo.BaseMutationOptions<OperationCreateBrowserGroupMutation, OperationCreateBrowserGroupMutationVariables>;
export const UpdateBrowserGroupDocument = gql`
    mutation UpdateBrowserGroup($input: UpdateMediaGroupInput!) {
  updateMediaGroup(input: $input) {
    group {
      ...GroupBrowserGroup
    }
  }
}
    ${GroupBrowserGroupFragmentDoc}`;
export type UpdateBrowserGroupMutationFn = Apollo.MutationFunction<OperationUpdateBrowserGroupMutation, OperationUpdateBrowserGroupMutationVariables>;

/**
 * __useUpdateBrowserGroupMutation__
 *
 * To run a mutation, you first call `useUpdateBrowserGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBrowserGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBrowserGroupMutation, { data, loading, error }] = useUpdateBrowserGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateBrowserGroupMutation(baseOptions?: Apollo.MutationHookOptions<OperationUpdateBrowserGroupMutation, OperationUpdateBrowserGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationUpdateBrowserGroupMutation, OperationUpdateBrowserGroupMutationVariables>(UpdateBrowserGroupDocument, options);
      }
export type UpdateBrowserGroupMutationHookResult = ReturnType<typeof useUpdateBrowserGroupMutation>;
export type UpdateBrowserGroupMutationResult = Apollo.MutationResult<OperationUpdateBrowserGroupMutation>;
export type UpdateBrowserGroupMutationOptions = Apollo.BaseMutationOptions<OperationUpdateBrowserGroupMutation, OperationUpdateBrowserGroupMutationVariables>;
export const DeleteBrowserGroupDocument = gql`
    mutation DeleteBrowserGroup($input: DeleteMediaGroupInput!) {
  deleteMediaGroup(input: $input) {
    groupId
  }
}
    `;
export type DeleteBrowserGroupMutationFn = Apollo.MutationFunction<OperationDeleteBrowserGroupMutation, OperationDeleteBrowserGroupMutationVariables>;

/**
 * __useDeleteBrowserGroupMutation__
 *
 * To run a mutation, you first call `useDeleteBrowserGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBrowserGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBrowserGroupMutation, { data, loading, error }] = useDeleteBrowserGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteBrowserGroupMutation(baseOptions?: Apollo.MutationHookOptions<OperationDeleteBrowserGroupMutation, OperationDeleteBrowserGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationDeleteBrowserGroupMutation, OperationDeleteBrowserGroupMutationVariables>(DeleteBrowserGroupDocument, options);
      }
export type DeleteBrowserGroupMutationHookResult = ReturnType<typeof useDeleteBrowserGroupMutation>;
export type DeleteBrowserGroupMutationResult = Apollo.MutationResult<OperationDeleteBrowserGroupMutation>;
export type DeleteBrowserGroupMutationOptions = Apollo.BaseMutationOptions<OperationDeleteBrowserGroupMutation, OperationDeleteBrowserGroupMutationVariables>;
export const AddBrowserMediaToGroupDocument = gql`
    mutation AddBrowserMediaToGroup($input: ChangeMediaGroupClassificationInput!) {
  addMediaToGroup(input: $input) {
    results {
      mediaId
      status
      errorCode
    }
  }
}
    `;
export type AddBrowserMediaToGroupMutationFn = Apollo.MutationFunction<OperationAddBrowserMediaToGroupMutation, OperationAddBrowserMediaToGroupMutationVariables>;

/**
 * __useAddBrowserMediaToGroupMutation__
 *
 * To run a mutation, you first call `useAddBrowserMediaToGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddBrowserMediaToGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addBrowserMediaToGroupMutation, { data, loading, error }] = useAddBrowserMediaToGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddBrowserMediaToGroupMutation(baseOptions?: Apollo.MutationHookOptions<OperationAddBrowserMediaToGroupMutation, OperationAddBrowserMediaToGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationAddBrowserMediaToGroupMutation, OperationAddBrowserMediaToGroupMutationVariables>(AddBrowserMediaToGroupDocument, options);
      }
export type AddBrowserMediaToGroupMutationHookResult = ReturnType<typeof useAddBrowserMediaToGroupMutation>;
export type AddBrowserMediaToGroupMutationResult = Apollo.MutationResult<OperationAddBrowserMediaToGroupMutation>;
export type AddBrowserMediaToGroupMutationOptions = Apollo.BaseMutationOptions<OperationAddBrowserMediaToGroupMutation, OperationAddBrowserMediaToGroupMutationVariables>;
export const RemoveBrowserMediaFromGroupDocument = gql`
    mutation RemoveBrowserMediaFromGroup($input: ChangeMediaGroupClassificationInput!) {
  removeMediaFromGroup(input: $input) {
    results {
      mediaId
      status
      errorCode
    }
  }
}
    `;
export type RemoveBrowserMediaFromGroupMutationFn = Apollo.MutationFunction<OperationRemoveBrowserMediaFromGroupMutation, OperationRemoveBrowserMediaFromGroupMutationVariables>;

/**
 * __useRemoveBrowserMediaFromGroupMutation__
 *
 * To run a mutation, you first call `useRemoveBrowserMediaFromGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveBrowserMediaFromGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeBrowserMediaFromGroupMutation, { data, loading, error }] = useRemoveBrowserMediaFromGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveBrowserMediaFromGroupMutation(baseOptions?: Apollo.MutationHookOptions<OperationRemoveBrowserMediaFromGroupMutation, OperationRemoveBrowserMediaFromGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationRemoveBrowserMediaFromGroupMutation, OperationRemoveBrowserMediaFromGroupMutationVariables>(RemoveBrowserMediaFromGroupDocument, options);
      }
export type RemoveBrowserMediaFromGroupMutationHookResult = ReturnType<typeof useRemoveBrowserMediaFromGroupMutation>;
export type RemoveBrowserMediaFromGroupMutationResult = Apollo.MutationResult<OperationRemoveBrowserMediaFromGroupMutation>;
export type RemoveBrowserMediaFromGroupMutationOptions = Apollo.BaseMutationOptions<OperationRemoveBrowserMediaFromGroupMutation, OperationRemoveBrowserMediaFromGroupMutationVariables>;
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
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>(CurrentUserDocument, options);
        }
// @ts-ignore
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>;
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCurrentUserQuery | undefined, OperationCurrentUserQueryVariables>;
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<OperationCurrentUserQuery, OperationCurrentUserQueryVariables>;
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
export type RegisterMemoriaUserMutationFn = Apollo.MutationFunction<OperationRegisterMemoriaUserMutation, OperationRegisterMemoriaUserMutationVariables>;

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
export function useRegisterMemoriaUserMutation(baseOptions?: Apollo.MutationHookOptions<OperationRegisterMemoriaUserMutation, OperationRegisterMemoriaUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationRegisterMemoriaUserMutation, OperationRegisterMemoriaUserMutationVariables>(RegisterMemoriaUserDocument, options);
      }
export type RegisterMemoriaUserMutationHookResult = ReturnType<typeof useRegisterMemoriaUserMutation>;
export type RegisterMemoriaUserMutationResult = Apollo.MutationResult<OperationRegisterMemoriaUserMutation>;
export type RegisterMemoriaUserMutationOptions = Apollo.BaseMutationOptions<OperationRegisterMemoriaUserMutation, OperationRegisterMemoriaUserMutationVariables>;
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
export type UpdateMemoriaUserProfileMutationFn = Apollo.MutationFunction<OperationUpdateMemoriaUserProfileMutation, OperationUpdateMemoriaUserProfileMutationVariables>;

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
export function useUpdateMemoriaUserProfileMutation(baseOptions?: Apollo.MutationHookOptions<OperationUpdateMemoriaUserProfileMutation, OperationUpdateMemoriaUserProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationUpdateMemoriaUserProfileMutation, OperationUpdateMemoriaUserProfileMutationVariables>(UpdateMemoriaUserProfileDocument, options);
      }
export type UpdateMemoriaUserProfileMutationHookResult = ReturnType<typeof useUpdateMemoriaUserProfileMutation>;
export type UpdateMemoriaUserProfileMutationResult = Apollo.MutationResult<OperationUpdateMemoriaUserProfileMutation>;
export type UpdateMemoriaUserProfileMutationOptions = Apollo.BaseMutationOptions<OperationUpdateMemoriaUserProfileMutation, OperationUpdateMemoriaUserProfileMutationVariables>;
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
export type SaveUserPreferencesMutationFn = Apollo.MutationFunction<OperationSaveUserPreferencesMutation, OperationSaveUserPreferencesMutationVariables>;

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
export function useSaveUserPreferencesMutation(baseOptions?: Apollo.MutationHookOptions<OperationSaveUserPreferencesMutation, OperationSaveUserPreferencesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationSaveUserPreferencesMutation, OperationSaveUserPreferencesMutationVariables>(SaveUserPreferencesDocument, options);
      }
export type SaveUserPreferencesMutationHookResult = ReturnType<typeof useSaveUserPreferencesMutation>;
export type SaveUserPreferencesMutationResult = Apollo.MutationResult<OperationSaveUserPreferencesMutation>;
export type SaveUserPreferencesMutationOptions = Apollo.BaseMutationOptions<OperationSaveUserPreferencesMutation, OperationSaveUserPreferencesMutationVariables>;
export const PersonalUsageDocument = gql`
    query PersonalUsage {
  me {
    id
    preferences {
      fileSizeUnit
    }
    usage {
      mediaCount
      storage {
        usedBytes
        effectiveLimitBytes
      }
      formatBreakdown {
        format
        mediaCount
        usedBytes
      }
    }
  }
}
    `;

/**
 * __usePersonalUsageQuery__
 *
 * To run a query within a React component, call `usePersonalUsageQuery` and pass it any options that fit your needs.
 * When your component renders, `usePersonalUsageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePersonalUsageQuery({
 *   variables: {
 *   },
 * });
 */
export function usePersonalUsageQuery(baseOptions?: Apollo.QueryHookOptions<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>(PersonalUsageDocument, options);
      }
export function usePersonalUsageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>(PersonalUsageDocument, options);
        }
// @ts-ignore
export function usePersonalUsageSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>;
export function usePersonalUsageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalUsageQuery | undefined, OperationPersonalUsageQueryVariables>;
export function usePersonalUsageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>(PersonalUsageDocument, options);
        }
export type PersonalUsageQueryHookResult = ReturnType<typeof usePersonalUsageQuery>;
export type PersonalUsageLazyQueryHookResult = ReturnType<typeof usePersonalUsageLazyQuery>;
export type PersonalUsageSuspenseQueryHookResult = ReturnType<typeof usePersonalUsageSuspenseQuery>;
export type PersonalUsageQueryResult = Apollo.QueryResult<OperationPersonalUsageQuery, OperationPersonalUsageQueryVariables>;

/** DashboardRecentMedia - generated from operations/dashboard.graphql. */
export type OperationDashboardRecentMediaQueryVariables = Exact<{ scope: OperationScopeInput }>;
export type OperationDashboardRecentMediaQuery = {
  mediaList: { edges: Array<{ node: { id: string; image: { variants: Array<{ url: string; width: number }> } | null } }> }
};
export const DashboardRecentMediaDocument = gql`
  query DashboardRecentMedia($scope: ScopeInput!) {
    mediaList(scope: $scope, first: 32) {
      edges { node { id image { variants { url width } } } }
    }
  }
`;
export function useDashboardRecentMediaQuery(
  baseOptions: Apollo.QueryHookOptions<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>
    & ({ variables: OperationDashboardRecentMediaQueryVariables; skip?: boolean } | { skip: boolean })
) {
  return Apollo.useQuery<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>(
    DashboardRecentMediaDocument, { ...defaultOptions, ...baseOptions }
  );
}
export type DashboardRecentMediaQueryHookResult = ReturnType<typeof useDashboardRecentMediaQuery>;

/** DashboardRecentGroups - generated from operations/dashboard.graphql. */
export type OperationDashboardRecentGroupsQueryVariables = Exact<{ scope: OperationScopeInput }>;
export type OperationDashboardRecentGroupsQuery = {
  mediaGroups: { edges: Array<{ node: {
    id: string;
    name: string;
    media: {
      edges: Array<{ node: { id: string; image: { variants: Array<{ url: string; width: number }> } | null } }>;
      pageInfo: { hasNextPage: boolean };
    };
  } }> };
};
export const DashboardRecentGroupsDocument = gql`
  query DashboardRecentGroups($scope: ScopeInput!) {
    mediaGroups(scope: $scope, sort: CREATED_AT_DESC, first: 6) {
      edges {
        node {
          id
          name
          media(first: 4) {
            edges { node { id image { variants { url width } } } }
            pageInfo { hasNextPage }
          }
        }
      }
    }
  }
`;
export function useDashboardRecentGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>
    & ({ variables: OperationDashboardRecentGroupsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  return Apollo.useQuery<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>(
    DashboardRecentGroupsDocument, { ...defaultOptions, ...baseOptions }
  );
}
export type DashboardRecentGroupsQueryHookResult = ReturnType<typeof useDashboardRecentGroupsQuery>;
