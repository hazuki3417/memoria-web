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

export type AddMediaToGroupsInput = {
  groupIds: Array<Scalars['ID']['input']>;
  mediaIds: Array<Scalars['ID']['input']>;
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
  mySettings: CommunitySettings;
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

export type CommunitySettings = {
  __typename?: 'CommunitySettings';
  accentColor: Scalars['String']['output'];
  alias?: Maybe<Scalars['String']['output']>;
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

export type InputFieldPath = {
  __typename?: 'InputFieldPath';
  segments: Array<Scalars['String']['output']>;
};

export type InputValidationFailure = {
  __typename?: 'InputValidationFailure';
  violations: Array<InputViolation>;
};

export type InputViolation = {
  __typename?: 'InputViolation';
  code: InputViolationCode;
  inputPaths: Array<InputFieldPath>;
  scope: InputViolationScope;
};

export enum InputViolationCode {
  InvalidCombination = 'INVALID_COMBINATION',
  InvalidFormat = 'INVALID_FORMAT',
  InvalidValue = 'INVALID_VALUE',
  OutOfRange = 'OUT_OF_RANGE',
  Required = 'REQUIRED',
  TooLong = 'TOO_LONG'
}

export enum InputViolationScope {
  Field = 'FIELD',
  FieldGroup = 'FIELD_GROUP',
  Form = 'FORM'
}

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
  addMediaToGroups: ChangeMediaGroupClassificationPayload;
  changeCommunityMemberRole: ChangeCommunityMemberRolePayload;
  createCommunity: CreateCommunityPayload;
  createMediaGroup: MediaGroupPayload;
  deleteMediaGroup: DeleteMediaGroupPayload;
  leaveCommunity: CommunityMembershipMutationPayload;
  registerUser: RegisterUserPayload;
  removeCommunityMember: CommunityMembershipMutationPayload;
  removeMediaFromGroup: ChangeMediaGroupClassificationPayload;
  updateCommunity: UpdateCommunityResult;
  updateCommunitySettings: UpdateCommunitySettingsResult;
  updateMediaGroup: UpdateMediaGroupPayload;
  updateUserPreferences: UpdateUserPreferencesResult;
  updateUserProfile: UpdateUserProfileResult;
};


export type MutationAcceptCommunityDeletionArgs = {
  input: AcceptCommunityDeletionInput;
};


export type MutationAddMediaToGroupArgs = {
  input: ChangeMediaGroupClassificationInput;
};


export type MutationAddMediaToGroupsArgs = {
  input: AddMediaToGroupsInput;
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


export type MutationUpdateCommunityArgs = {
  input: UpdateCommunityInput;
};


export type MutationUpdateCommunitySettingsArgs = {
  input: UpdateCommunitySettingsInput;
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
  mediaTags: MediaTagConnection;
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


export type QueryMediaTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  scope: ScopeInput;
  search?: InputMaybe<Scalars['String']['input']>;
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

export type UpdateCommunityInput = {
  communityId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type UpdateCommunityResult = InputValidationFailure | UpdateCommunitySuccess;

export type UpdateCommunitySettingsInput = {
  accentColor?: InputMaybe<Scalars['String']['input']>;
  alias?: InputMaybe<Scalars['String']['input']>;
  communityId: Scalars['ID']['input'];
};

export type UpdateCommunitySettingsResult = InputValidationFailure | UpdateCommunitySettingsSuccess;

export type UpdateCommunitySettingsSuccess = {
  __typename?: 'UpdateCommunitySettingsSuccess';
  settings: CommunitySettings;
};

export type UpdateCommunitySuccess = {
  __typename?: 'UpdateCommunitySuccess';
  community: Community;
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

export type UpdateUserPreferencesResult = InputValidationFailure | UpdateUserPreferencesSuccess;

export type UpdateUserPreferencesSuccess = {
  __typename?: 'UpdateUserPreferencesSuccess';
  preferences: UserPreferences;
};

export type UpdateUserProfileInput = {
  nickname: Scalars['String']['input'];
};

export type UpdateUserProfileResult = InputValidationFailure | UpdateUserProfileSuccess;

export type UpdateUserProfileSuccess = {
  __typename?: 'UpdateUserProfileSuccess';
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

export type OperationAddMediaToGroupsInput = {
  groupIds: Array<string | number>;
  mediaIds: Array<string | number>;
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

export type OperationInputViolationCode =
  | 'INVALID_COMBINATION'
  | 'INVALID_FORMAT'
  | 'INVALID_VALUE'
  | 'OUT_OF_RANGE'
  | 'REQUIRED'
  | 'TOO_LONG';

export type OperationInputViolationScope =
  | 'FIELD'
  | 'FIELD_GROUP'
  | 'FORM';

export type OperationMediaFilterInput = {
  tagIds?: Array<string | number> | null | undefined;
};

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

export type OperationProcessingStatus =
  | 'FAILED'
  | 'PROCESSING'
  | 'READY';

export type OperationRegisterUserInput = {
  nickname: string;
};

export type OperationRemoveCommunityMemberInput = {
  communityId: string | number;
  userId: string | number;
};

export type OperationScopeInput = {
  communityId?: string | number | null | undefined;
  type: OperationScopeType;
};

export type OperationScopeType =
  | 'COMMUNITY'
  | 'PERSONAL';

export type OperationUpdateCommunityInput = {
  communityId: string | number;
  name: string;
};

export type OperationUpdateCommunitySettingsInput = {
  accentColor?: string | null | undefined;
  alias?: string | null | undefined;
  communityId: string | number;
};

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


export type OperationMyCommunitiesQuery = { myCommunities: Array<{ id: string, name: string, createdAt: string, updatedAt: string, mySettings: { accentColor: string, alias: string | null } }> };

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

export type OperationUpdateCommunityMutationVariables = Exact<{
  input: OperationUpdateCommunityInput;
}>;


export type OperationUpdateCommunityMutation = { updateCommunity:
    | { __typename: 'InputValidationFailure', violations: Array<{ scope: OperationInputViolationScope, code: OperationInputViolationCode, inputPaths: Array<{ segments: Array<string> }> }> }
    | { __typename: 'UpdateCommunitySuccess', community: { id: string, name: string, createdAt: string, updatedAt: string } }
   };

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

export type OperationCommunityMySettingsQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunityMySettingsQuery = { community: { id: string, mySettings: { accentColor: string, alias: string | null } } | null };

export type OperationUpdateCommunitySettingsMutationVariables = Exact<{
  input: OperationUpdateCommunitySettingsInput;
}>;


export type OperationUpdateCommunitySettingsMutation = { updateCommunitySettings:
    | { __typename: 'InputValidationFailure', violations: Array<{ scope: OperationInputViolationScope, code: OperationInputViolationCode, inputPaths: Array<{ segments: Array<string> }> }> }
    | { __typename: 'UpdateCommunitySettingsSuccess', settings: { accentColor: string, alias: string | null } }
   };

export type OperationCommunitySettingsCacheFragment = { mySettings: { accentColor: string, alias: string | null } };

export type OperationCommunitySettingsMembershipQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationCommunitySettingsMembershipQuery = { myCommunities: Array<{ id: string, mySettings: { accentColor: string } }> };

export type OperationCommunitySettingsGeneralQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunitySettingsGeneralQuery = { community: { id: string, name: string } | null, communityMembers: Array<{ userId: string, role: OperationCommunityMemberRole }>, me: { id: string } | null };

export type OperationCommunitySettingsMembersQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunitySettingsMembersQuery = { community: { id: string } | null, communityMembers: Array<{ userId: string, nickname: string, role: OperationCommunityMemberRole }>, me: { id: string } | null };

export type OperationCommunitySettingsUsageQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunitySettingsUsageQuery = { communityUsage: { mediaCount: number, storage: { usedBytes: string, effectiveLimitBytes: string }, formatBreakdown: Array<{ format: OperationOriginalImageFormat, mediaCount: number, usedBytes: string }> }, me: { id: string, preferences: { fileSizeUnit: OperationFileSizeUnit } } | null };

export type OperationCommunitySettingsNameInspectionQueryVariables = Exact<{
  communityId: string | number;
}>;


export type OperationCommunitySettingsNameInspectionQuery = { community: { id: string, name: string } | null };

export type OperationDashboardRecentMediaQueryVariables = Exact<{
  scope: OperationScopeInput;
}>;


export type OperationDashboardRecentMediaQuery = { mediaList: { edges: Array<{ node: { id: string, image: { variants: Array<{ url: string, width: number }> } | null } }> } };

export type OperationDashboardRecentGroupsQueryVariables = Exact<{
  scope: OperationScopeInput;
}>;


export type OperationDashboardRecentGroupsQuery = { mediaGroups: { edges: Array<{ node: { id: string, name: string, media: { edges: Array<{ node: { id: string, image: { variants: Array<{ url: string, width: number }> } | null } }>, pageInfo: { hasNextPage: boolean } } } }> } };

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

export type OperationAddBrowserMediaToGroupsMutationVariables = Exact<{
  input: OperationAddMediaToGroupsInput;
}>;


export type OperationAddBrowserMediaToGroupsMutation = { addMediaToGroups: { results: Array<{ mediaId: string, status: OperationBulkItemStatus, errorCode: string | null }> } };

export type OperationMediaBrowserListQueryVariables = Exact<{
  scope: OperationScopeInput;
  filter?: OperationMediaFilterInput | null | undefined;
  first: number;
  after?: string | null | undefined;
}>;


export type OperationMediaBrowserListQuery = { mediaList: { edges: Array<{ cursor: string, node: { id: string, originalFileName: string, processing: { status: OperationProcessingStatus } | null, image: { variants: Array<{ url: string, width: number }> } | null } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null } } };

export type OperationMediaBrowserTagsQueryVariables = Exact<{
  scope: OperationScopeInput;
  first: number;
  after?: string | null | undefined;
}>;


export type OperationMediaBrowserTagsQuery = { mediaTags: { edges: Array<{ cursor: string, node: { id: string, name: string } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null } } };

export type OperationCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationCurrentUserQuery = { me: { id: string, profile: { nickname: string }, preferences: { personalAccentColor: string, dateFormat: OperationDateFormat, fileSizeUnit: OperationFileSizeUnit, mediaThumbnailSize: OperationMediaThumbnailSize, mediaDetailNavigationWrap: boolean, mediaDetailInitialInfoWide: boolean, mediaDetailInitialInfoMedium: boolean } } | null };

export type OperationRegisterMemoriaUserMutationVariables = Exact<{
  input: OperationRegisterUserInput;
}>;


export type OperationRegisterMemoriaUserMutation = { registerUser: { user: { id: string, profile: { nickname: string } } } };

export type OperationUpdateMemoriaUserProfileMutationVariables = Exact<{
  input: OperationUpdateUserProfileInput;
}>;


export type OperationUpdateMemoriaUserProfileMutation = { updateUserProfile:
    | { __typename: 'InputValidationFailure', violations: Array<{ scope: OperationInputViolationScope, code: OperationInputViolationCode, inputPaths: Array<{ segments: Array<string> }> }> }
    | { __typename: 'UpdateUserProfileSuccess', user: { id: string, profile: { nickname: string } } }
   };

export type OperationSaveUserPreferencesMutationVariables = Exact<{
  input: OperationUpdateUserPreferencesInput;
}>;


export type OperationSaveUserPreferencesMutation = { updateUserPreferences:
    | { __typename: 'InputValidationFailure', violations: Array<{ scope: OperationInputViolationScope, code: OperationInputViolationCode, inputPaths: Array<{ segments: Array<string> }> }> }
    | { __typename: 'UpdateUserPreferencesSuccess', preferences: { personalAccentColor: string, dateFormat: OperationDateFormat, fileSizeUnit: OperationFileSizeUnit, mediaThumbnailSize: OperationMediaThumbnailSize, mediaDetailNavigationWrap: boolean, mediaDetailInitialInfoWide: boolean, mediaDetailInitialInfoMedium: boolean } }
   };

export type OperationPersonalUsageQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationPersonalUsageQuery = { me: { id: string, preferences: { fileSizeUnit: OperationFileSizeUnit }, usage: { mediaCount: number, storage: { usedBytes: string, effectiveLimitBytes: string }, formatBreakdown: Array<{ format: OperationOriginalImageFormat, mediaCount: number, usedBytes: string }> } } | null };

export type OperationPersonalSettingsAccentQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationPersonalSettingsAccentQuery = { me: { id: string, preferences: { personalAccentColor: string } } | null };

export type OperationPersonalSettingsProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationPersonalSettingsProfileQuery = { me: { id: string, profile: { nickname: string } } | null };

export type OperationPersonalSettingsPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type OperationPersonalSettingsPreferencesQuery = { me: { id: string, preferences: { personalAccentColor: string, dateFormat: OperationDateFormat, fileSizeUnit: OperationFileSizeUnit, mediaThumbnailSize: OperationMediaThumbnailSize, mediaDetailNavigationWrap: boolean, mediaDetailInitialInfoWide: boolean, mediaDetailInitialInfoMedium: boolean } } | null };

export const CommunitySettingsCacheFragmentDoc = gql`
    fragment CommunitySettingsCache on Community {
  mySettings {
    accentColor
    alias
  }
}
    `;
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
    mySettings {
      accentColor
      alias
    }
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
// @ts-expect-error
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
// @ts-expect-error
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
// @ts-expect-error
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
// @ts-expect-error
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
export const UpdateCommunityDocument = gql`
    mutation UpdateCommunity($input: UpdateCommunityInput!) {
  updateCommunity(input: $input) {
    __typename
    ... on UpdateCommunitySuccess {
      community {
        id
        name
        createdAt
        updatedAt
      }
    }
    ... on InputValidationFailure {
      violations {
        scope
        code
        inputPaths {
          segments
        }
      }
    }
  }
}
    `;
export type UpdateCommunityMutationFn = Apollo.MutationFunction<OperationUpdateCommunityMutation, OperationUpdateCommunityMutationVariables>;

/**
 * __useUpdateCommunityMutation__
 *
 * To run a mutation, you first call `useUpdateCommunityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommunityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommunityMutation, { data, loading, error }] = useUpdateCommunityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCommunityMutation(baseOptions?: Apollo.MutationHookOptions<OperationUpdateCommunityMutation, OperationUpdateCommunityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationUpdateCommunityMutation, OperationUpdateCommunityMutationVariables>(UpdateCommunityDocument, options);
      }
export type UpdateCommunityMutationHookResult = ReturnType<typeof useUpdateCommunityMutation>;
export type UpdateCommunityMutationResult = Apollo.MutationResult<OperationUpdateCommunityMutation>;
export type UpdateCommunityMutationOptions = Apollo.BaseMutationOptions<OperationUpdateCommunityMutation, OperationUpdateCommunityMutationVariables>;
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
// @ts-expect-error
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
export const CommunityMySettingsDocument = gql`
    query CommunityMySettings($communityId: ID!) {
  community(communityId: $communityId) {
    id
    mySettings {
      accentColor
      alias
    }
  }
}
    `;

/**
 * __useCommunityMySettingsQuery__
 *
 * To run a query within a React component, call `useCommunityMySettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunityMySettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunityMySettingsQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunityMySettingsQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables> & ({ variables: OperationCommunityMySettingsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>(CommunityMySettingsDocument, options);
      }
export function useCommunityMySettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>(CommunityMySettingsDocument, options);
        }
// @ts-expect-error
export function useCommunityMySettingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>;
export function useCommunityMySettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunityMySettingsQuery | undefined, OperationCommunityMySettingsQueryVariables>;
export function useCommunityMySettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>(CommunityMySettingsDocument, options);
        }
export type CommunityMySettingsQueryHookResult = ReturnType<typeof useCommunityMySettingsQuery>;
export type CommunityMySettingsLazyQueryHookResult = ReturnType<typeof useCommunityMySettingsLazyQuery>;
export type CommunityMySettingsSuspenseQueryHookResult = ReturnType<typeof useCommunityMySettingsSuspenseQuery>;
export type CommunityMySettingsQueryResult = Apollo.QueryResult<OperationCommunityMySettingsQuery, OperationCommunityMySettingsQueryVariables>;
export const UpdateCommunitySettingsDocument = gql`
    mutation UpdateCommunitySettings($input: UpdateCommunitySettingsInput!) {
  updateCommunitySettings(input: $input) {
    __typename
    ... on UpdateCommunitySettingsSuccess {
      settings {
        accentColor
        alias
      }
    }
    ... on InputValidationFailure {
      violations {
        scope
        code
        inputPaths {
          segments
        }
      }
    }
  }
}
    `;
export type UpdateCommunitySettingsMutationFn = Apollo.MutationFunction<OperationUpdateCommunitySettingsMutation, OperationUpdateCommunitySettingsMutationVariables>;

/**
 * __useUpdateCommunitySettingsMutation__
 *
 * To run a mutation, you first call `useUpdateCommunitySettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommunitySettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommunitySettingsMutation, { data, loading, error }] = useUpdateCommunitySettingsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCommunitySettingsMutation(baseOptions?: Apollo.MutationHookOptions<OperationUpdateCommunitySettingsMutation, OperationUpdateCommunitySettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationUpdateCommunitySettingsMutation, OperationUpdateCommunitySettingsMutationVariables>(UpdateCommunitySettingsDocument, options);
      }
export type UpdateCommunitySettingsMutationHookResult = ReturnType<typeof useUpdateCommunitySettingsMutation>;
export type UpdateCommunitySettingsMutationResult = Apollo.MutationResult<OperationUpdateCommunitySettingsMutation>;
export type UpdateCommunitySettingsMutationOptions = Apollo.BaseMutationOptions<OperationUpdateCommunitySettingsMutation, OperationUpdateCommunitySettingsMutationVariables>;
export const CommunitySettingsMembershipDocument = gql`
    query CommunitySettingsMembership {
  myCommunities {
    id
    mySettings {
      accentColor
    }
  }
}
    `;

/**
 * __useCommunitySettingsMembershipQuery__
 *
 * To run a query within a React component, call `useCommunitySettingsMembershipQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunitySettingsMembershipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunitySettingsMembershipQuery({
 *   variables: {
 *   },
 * });
 */
export function useCommunitySettingsMembershipQuery(baseOptions?: Apollo.QueryHookOptions<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>(CommunitySettingsMembershipDocument, options);
      }
export function useCommunitySettingsMembershipLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>(CommunitySettingsMembershipDocument, options);
        }
// @ts-expect-error
export function useCommunitySettingsMembershipSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>;
export function useCommunitySettingsMembershipSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsMembershipQuery | undefined, OperationCommunitySettingsMembershipQueryVariables>;
export function useCommunitySettingsMembershipSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>(CommunitySettingsMembershipDocument, options);
        }
export type CommunitySettingsMembershipQueryHookResult = ReturnType<typeof useCommunitySettingsMembershipQuery>;
export type CommunitySettingsMembershipLazyQueryHookResult = ReturnType<typeof useCommunitySettingsMembershipLazyQuery>;
export type CommunitySettingsMembershipSuspenseQueryHookResult = ReturnType<typeof useCommunitySettingsMembershipSuspenseQuery>;
export type CommunitySettingsMembershipQueryResult = Apollo.QueryResult<OperationCommunitySettingsMembershipQuery, OperationCommunitySettingsMembershipQueryVariables>;
export const CommunitySettingsGeneralDocument = gql`
    query CommunitySettingsGeneral($communityId: ID!) {
  community(communityId: $communityId) {
    id
    name
  }
  communityMembers(communityId: $communityId) {
    userId
    role
  }
  me {
    id
  }
}
    `;

/**
 * __useCommunitySettingsGeneralQuery__
 *
 * To run a query within a React component, call `useCommunitySettingsGeneralQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunitySettingsGeneralQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunitySettingsGeneralQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunitySettingsGeneralQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables> & ({ variables: OperationCommunitySettingsGeneralQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>(CommunitySettingsGeneralDocument, options);
      }
export function useCommunitySettingsGeneralLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>(CommunitySettingsGeneralDocument, options);
        }
// @ts-expect-error
export function useCommunitySettingsGeneralSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>;
export function useCommunitySettingsGeneralSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsGeneralQuery | undefined, OperationCommunitySettingsGeneralQueryVariables>;
export function useCommunitySettingsGeneralSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>(CommunitySettingsGeneralDocument, options);
        }
export type CommunitySettingsGeneralQueryHookResult = ReturnType<typeof useCommunitySettingsGeneralQuery>;
export type CommunitySettingsGeneralLazyQueryHookResult = ReturnType<typeof useCommunitySettingsGeneralLazyQuery>;
export type CommunitySettingsGeneralSuspenseQueryHookResult = ReturnType<typeof useCommunitySettingsGeneralSuspenseQuery>;
export type CommunitySettingsGeneralQueryResult = Apollo.QueryResult<OperationCommunitySettingsGeneralQuery, OperationCommunitySettingsGeneralQueryVariables>;
export const CommunitySettingsMembersDocument = gql`
    query CommunitySettingsMembers($communityId: ID!) {
  community(communityId: $communityId) {
    id
  }
  communityMembers(communityId: $communityId) {
    userId
    nickname
    role
  }
  me {
    id
  }
}
    `;

/**
 * __useCommunitySettingsMembersQuery__
 *
 * To run a query within a React component, call `useCommunitySettingsMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunitySettingsMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunitySettingsMembersQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunitySettingsMembersQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables> & ({ variables: OperationCommunitySettingsMembersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>(CommunitySettingsMembersDocument, options);
      }
export function useCommunitySettingsMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>(CommunitySettingsMembersDocument, options);
        }
// @ts-expect-error
export function useCommunitySettingsMembersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>;
export function useCommunitySettingsMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsMembersQuery | undefined, OperationCommunitySettingsMembersQueryVariables>;
export function useCommunitySettingsMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>(CommunitySettingsMembersDocument, options);
        }
export type CommunitySettingsMembersQueryHookResult = ReturnType<typeof useCommunitySettingsMembersQuery>;
export type CommunitySettingsMembersLazyQueryHookResult = ReturnType<typeof useCommunitySettingsMembersLazyQuery>;
export type CommunitySettingsMembersSuspenseQueryHookResult = ReturnType<typeof useCommunitySettingsMembersSuspenseQuery>;
export type CommunitySettingsMembersQueryResult = Apollo.QueryResult<OperationCommunitySettingsMembersQuery, OperationCommunitySettingsMembersQueryVariables>;
export const CommunitySettingsUsageDocument = gql`
    query CommunitySettingsUsage($communityId: ID!) {
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
  me {
    id
    preferences {
      fileSizeUnit
    }
  }
}
    `;

/**
 * __useCommunitySettingsUsageQuery__
 *
 * To run a query within a React component, call `useCommunitySettingsUsageQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunitySettingsUsageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunitySettingsUsageQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunitySettingsUsageQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables> & ({ variables: OperationCommunitySettingsUsageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>(CommunitySettingsUsageDocument, options);
      }
export function useCommunitySettingsUsageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>(CommunitySettingsUsageDocument, options);
        }
// @ts-expect-error
export function useCommunitySettingsUsageSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>;
export function useCommunitySettingsUsageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsUsageQuery | undefined, OperationCommunitySettingsUsageQueryVariables>;
export function useCommunitySettingsUsageSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>(CommunitySettingsUsageDocument, options);
        }
export type CommunitySettingsUsageQueryHookResult = ReturnType<typeof useCommunitySettingsUsageQuery>;
export type CommunitySettingsUsageLazyQueryHookResult = ReturnType<typeof useCommunitySettingsUsageLazyQuery>;
export type CommunitySettingsUsageSuspenseQueryHookResult = ReturnType<typeof useCommunitySettingsUsageSuspenseQuery>;
export type CommunitySettingsUsageQueryResult = Apollo.QueryResult<OperationCommunitySettingsUsageQuery, OperationCommunitySettingsUsageQueryVariables>;
export const CommunitySettingsNameInspectionDocument = gql`
    query CommunitySettingsNameInspection($communityId: ID!) {
  community(communityId: $communityId) {
    id
    name
  }
}
    `;

/**
 * __useCommunitySettingsNameInspectionQuery__
 *
 * To run a query within a React component, call `useCommunitySettingsNameInspectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommunitySettingsNameInspectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommunitySettingsNameInspectionQuery({
 *   variables: {
 *      communityId: // value for 'communityId'
 *   },
 * });
 */
export function useCommunitySettingsNameInspectionQuery(baseOptions: Apollo.QueryHookOptions<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables> & ({ variables: OperationCommunitySettingsNameInspectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>(CommunitySettingsNameInspectionDocument, options);
      }
export function useCommunitySettingsNameInspectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>(CommunitySettingsNameInspectionDocument, options);
        }
// @ts-expect-error
export function useCommunitySettingsNameInspectionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>;
export function useCommunitySettingsNameInspectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>): Apollo.UseSuspenseQueryResult<OperationCommunitySettingsNameInspectionQuery | undefined, OperationCommunitySettingsNameInspectionQueryVariables>;
export function useCommunitySettingsNameInspectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>(CommunitySettingsNameInspectionDocument, options);
        }
export type CommunitySettingsNameInspectionQueryHookResult = ReturnType<typeof useCommunitySettingsNameInspectionQuery>;
export type CommunitySettingsNameInspectionLazyQueryHookResult = ReturnType<typeof useCommunitySettingsNameInspectionLazyQuery>;
export type CommunitySettingsNameInspectionSuspenseQueryHookResult = ReturnType<typeof useCommunitySettingsNameInspectionSuspenseQuery>;
export type CommunitySettingsNameInspectionQueryResult = Apollo.QueryResult<OperationCommunitySettingsNameInspectionQuery, OperationCommunitySettingsNameInspectionQueryVariables>;
export const DashboardRecentMediaDocument = gql`
    query DashboardRecentMedia($scope: ScopeInput!) {
  mediaList(scope: $scope, first: 32) {
    edges {
      node {
        id
        image {
          variants {
            url
            width
          }
        }
      }
    }
  }
}
    `;

/**
 * __useDashboardRecentMediaQuery__
 *
 * To run a query within a React component, call `useDashboardRecentMediaQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardRecentMediaQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardRecentMediaQuery({
 *   variables: {
 *      scope: // value for 'scope'
 *   },
 * });
 */
export function useDashboardRecentMediaQuery(baseOptions: Apollo.QueryHookOptions<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables> & ({ variables: OperationDashboardRecentMediaQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>(DashboardRecentMediaDocument, options);
      }
export function useDashboardRecentMediaLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>(DashboardRecentMediaDocument, options);
        }
// @ts-expect-error
export function useDashboardRecentMediaSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>): Apollo.UseSuspenseQueryResult<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>;
export function useDashboardRecentMediaSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>): Apollo.UseSuspenseQueryResult<OperationDashboardRecentMediaQuery | undefined, OperationDashboardRecentMediaQueryVariables>;
export function useDashboardRecentMediaSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>(DashboardRecentMediaDocument, options);
        }
export type DashboardRecentMediaQueryHookResult = ReturnType<typeof useDashboardRecentMediaQuery>;
export type DashboardRecentMediaLazyQueryHookResult = ReturnType<typeof useDashboardRecentMediaLazyQuery>;
export type DashboardRecentMediaSuspenseQueryHookResult = ReturnType<typeof useDashboardRecentMediaSuspenseQuery>;
export type DashboardRecentMediaQueryResult = Apollo.QueryResult<OperationDashboardRecentMediaQuery, OperationDashboardRecentMediaQueryVariables>;
export const DashboardRecentGroupsDocument = gql`
    query DashboardRecentGroups($scope: ScopeInput!) {
  mediaGroups(scope: $scope, sort: CREATED_AT_DESC, first: 6) {
    edges {
      node {
        id
        name
        media(first: 4) {
          edges {
            node {
              id
              image {
                variants {
                  url
                  width
                }
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  }
}
    `;

/**
 * __useDashboardRecentGroupsQuery__
 *
 * To run a query within a React component, call `useDashboardRecentGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardRecentGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardRecentGroupsQuery({
 *   variables: {
 *      scope: // value for 'scope'
 *   },
 * });
 */
export function useDashboardRecentGroupsQuery(baseOptions: Apollo.QueryHookOptions<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables> & ({ variables: OperationDashboardRecentGroupsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>(DashboardRecentGroupsDocument, options);
      }
export function useDashboardRecentGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>(DashboardRecentGroupsDocument, options);
        }
// @ts-expect-error
export function useDashboardRecentGroupsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>;
export function useDashboardRecentGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationDashboardRecentGroupsQuery | undefined, OperationDashboardRecentGroupsQueryVariables>;
export function useDashboardRecentGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>(DashboardRecentGroupsDocument, options);
        }
export type DashboardRecentGroupsQueryHookResult = ReturnType<typeof useDashboardRecentGroupsQuery>;
export type DashboardRecentGroupsLazyQueryHookResult = ReturnType<typeof useDashboardRecentGroupsLazyQuery>;
export type DashboardRecentGroupsSuspenseQueryHookResult = ReturnType<typeof useDashboardRecentGroupsSuspenseQuery>;
export type DashboardRecentGroupsQueryResult = Apollo.QueryResult<OperationDashboardRecentGroupsQuery, OperationDashboardRecentGroupsQueryVariables>;
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
// @ts-expect-error
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
// @ts-expect-error
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
// @ts-expect-error
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
export const AddBrowserMediaToGroupsDocument = gql`
    mutation AddBrowserMediaToGroups($input: AddMediaToGroupsInput!) {
  addMediaToGroups(input: $input) {
    results {
      mediaId
      status
      errorCode
    }
  }
}
    `;
export type AddBrowserMediaToGroupsMutationFn = Apollo.MutationFunction<OperationAddBrowserMediaToGroupsMutation, OperationAddBrowserMediaToGroupsMutationVariables>;

/**
 * __useAddBrowserMediaToGroupsMutation__
 *
 * To run a mutation, you first call `useAddBrowserMediaToGroupsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddBrowserMediaToGroupsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addBrowserMediaToGroupsMutation, { data, loading, error }] = useAddBrowserMediaToGroupsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddBrowserMediaToGroupsMutation(baseOptions?: Apollo.MutationHookOptions<OperationAddBrowserMediaToGroupsMutation, OperationAddBrowserMediaToGroupsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OperationAddBrowserMediaToGroupsMutation, OperationAddBrowserMediaToGroupsMutationVariables>(AddBrowserMediaToGroupsDocument, options);
      }
export type AddBrowserMediaToGroupsMutationHookResult = ReturnType<typeof useAddBrowserMediaToGroupsMutation>;
export type AddBrowserMediaToGroupsMutationResult = Apollo.MutationResult<OperationAddBrowserMediaToGroupsMutation>;
export type AddBrowserMediaToGroupsMutationOptions = Apollo.BaseMutationOptions<OperationAddBrowserMediaToGroupsMutation, OperationAddBrowserMediaToGroupsMutationVariables>;
export const MediaBrowserListDocument = gql`
    query MediaBrowserList($scope: ScopeInput!, $filter: MediaFilterInput, $first: Int!, $after: String) {
  mediaList(scope: $scope, filter: $filter, first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        originalFileName
        processing {
          status
        }
        image {
          variants {
            url
            width
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useMediaBrowserListQuery__
 *
 * To run a query within a React component, call `useMediaBrowserListQuery` and pass it any options that fit your needs.
 * When your component renders, `useMediaBrowserListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMediaBrowserListQuery({
 *   variables: {
 *      scope: // value for 'scope'
 *      filter: // value for 'filter'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useMediaBrowserListQuery(baseOptions: Apollo.QueryHookOptions<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables> & ({ variables: OperationMediaBrowserListQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>(MediaBrowserListDocument, options);
      }
export function useMediaBrowserListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>(MediaBrowserListDocument, options);
        }
// @ts-expect-error
export function useMediaBrowserListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>): Apollo.UseSuspenseQueryResult<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>;
export function useMediaBrowserListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>): Apollo.UseSuspenseQueryResult<OperationMediaBrowserListQuery | undefined, OperationMediaBrowserListQueryVariables>;
export function useMediaBrowserListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>(MediaBrowserListDocument, options);
        }
export type MediaBrowserListQueryHookResult = ReturnType<typeof useMediaBrowserListQuery>;
export type MediaBrowserListLazyQueryHookResult = ReturnType<typeof useMediaBrowserListLazyQuery>;
export type MediaBrowserListSuspenseQueryHookResult = ReturnType<typeof useMediaBrowserListSuspenseQuery>;
export type MediaBrowserListQueryResult = Apollo.QueryResult<OperationMediaBrowserListQuery, OperationMediaBrowserListQueryVariables>;
export const MediaBrowserTagsDocument = gql`
    query MediaBrowserTags($scope: ScopeInput!, $first: Int!, $after: String) {
  mediaTags(scope: $scope, first: $first, after: $after) {
    edges {
      cursor
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
    `;

/**
 * __useMediaBrowserTagsQuery__
 *
 * To run a query within a React component, call `useMediaBrowserTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMediaBrowserTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMediaBrowserTagsQuery({
 *   variables: {
 *      scope: // value for 'scope'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useMediaBrowserTagsQuery(baseOptions: Apollo.QueryHookOptions<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables> & ({ variables: OperationMediaBrowserTagsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>(MediaBrowserTagsDocument, options);
      }
export function useMediaBrowserTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>(MediaBrowserTagsDocument, options);
        }
// @ts-expect-error
export function useMediaBrowserTagsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>;
export function useMediaBrowserTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>): Apollo.UseSuspenseQueryResult<OperationMediaBrowserTagsQuery | undefined, OperationMediaBrowserTagsQueryVariables>;
export function useMediaBrowserTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>(MediaBrowserTagsDocument, options);
        }
export type MediaBrowserTagsQueryHookResult = ReturnType<typeof useMediaBrowserTagsQuery>;
export type MediaBrowserTagsLazyQueryHookResult = ReturnType<typeof useMediaBrowserTagsLazyQuery>;
export type MediaBrowserTagsSuspenseQueryHookResult = ReturnType<typeof useMediaBrowserTagsSuspenseQuery>;
export type MediaBrowserTagsQueryResult = Apollo.QueryResult<OperationMediaBrowserTagsQuery, OperationMediaBrowserTagsQueryVariables>;
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
// @ts-expect-error
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
    __typename
    ... on UpdateUserProfileSuccess {
      user {
        id
        profile {
          nickname
        }
      }
    }
    ... on InputValidationFailure {
      violations {
        scope
        code
        inputPaths {
          segments
        }
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
    __typename
    ... on InputValidationFailure {
      violations {
        scope
        code
        inputPaths {
          segments
        }
      }
    }
    ... on UpdateUserPreferencesSuccess {
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
// @ts-expect-error
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
export const PersonalSettingsAccentDocument = gql`
    query PersonalSettingsAccent {
  me {
    id
    preferences {
      personalAccentColor
    }
  }
}
    `;

/**
 * __usePersonalSettingsAccentQuery__
 *
 * To run a query within a React component, call `usePersonalSettingsAccentQuery` and pass it any options that fit your needs.
 * When your component renders, `usePersonalSettingsAccentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePersonalSettingsAccentQuery({
 *   variables: {
 *   },
 * });
 */
export function usePersonalSettingsAccentQuery(baseOptions?: Apollo.QueryHookOptions<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>(PersonalSettingsAccentDocument, options);
      }
export function usePersonalSettingsAccentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>(PersonalSettingsAccentDocument, options);
        }
// @ts-expect-error
export function usePersonalSettingsAccentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>;
export function usePersonalSettingsAccentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalSettingsAccentQuery | undefined, OperationPersonalSettingsAccentQueryVariables>;
export function usePersonalSettingsAccentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>(PersonalSettingsAccentDocument, options);
        }
export type PersonalSettingsAccentQueryHookResult = ReturnType<typeof usePersonalSettingsAccentQuery>;
export type PersonalSettingsAccentLazyQueryHookResult = ReturnType<typeof usePersonalSettingsAccentLazyQuery>;
export type PersonalSettingsAccentSuspenseQueryHookResult = ReturnType<typeof usePersonalSettingsAccentSuspenseQuery>;
export type PersonalSettingsAccentQueryResult = Apollo.QueryResult<OperationPersonalSettingsAccentQuery, OperationPersonalSettingsAccentQueryVariables>;
export const PersonalSettingsProfileDocument = gql`
    query PersonalSettingsProfile {
  me {
    id
    profile {
      nickname
    }
  }
}
    `;

/**
 * __usePersonalSettingsProfileQuery__
 *
 * To run a query within a React component, call `usePersonalSettingsProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `usePersonalSettingsProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePersonalSettingsProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function usePersonalSettingsProfileQuery(baseOptions?: Apollo.QueryHookOptions<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>(PersonalSettingsProfileDocument, options);
      }
export function usePersonalSettingsProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>(PersonalSettingsProfileDocument, options);
        }
// @ts-expect-error
export function usePersonalSettingsProfileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>;
export function usePersonalSettingsProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalSettingsProfileQuery | undefined, OperationPersonalSettingsProfileQueryVariables>;
export function usePersonalSettingsProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>(PersonalSettingsProfileDocument, options);
        }
export type PersonalSettingsProfileQueryHookResult = ReturnType<typeof usePersonalSettingsProfileQuery>;
export type PersonalSettingsProfileLazyQueryHookResult = ReturnType<typeof usePersonalSettingsProfileLazyQuery>;
export type PersonalSettingsProfileSuspenseQueryHookResult = ReturnType<typeof usePersonalSettingsProfileSuspenseQuery>;
export type PersonalSettingsProfileQueryResult = Apollo.QueryResult<OperationPersonalSettingsProfileQuery, OperationPersonalSettingsProfileQueryVariables>;
export const PersonalSettingsPreferencesDocument = gql`
    query PersonalSettingsPreferences {
  me {
    id
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
 * __usePersonalSettingsPreferencesQuery__
 *
 * To run a query within a React component, call `usePersonalSettingsPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePersonalSettingsPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePersonalSettingsPreferencesQuery({
 *   variables: {
 *   },
 * });
 */
export function usePersonalSettingsPreferencesQuery(baseOptions?: Apollo.QueryHookOptions<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>(PersonalSettingsPreferencesDocument, options);
      }
export function usePersonalSettingsPreferencesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>(PersonalSettingsPreferencesDocument, options);
        }
// @ts-expect-error
export function usePersonalSettingsPreferencesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>;
export function usePersonalSettingsPreferencesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>): Apollo.UseSuspenseQueryResult<OperationPersonalSettingsPreferencesQuery | undefined, OperationPersonalSettingsPreferencesQueryVariables>;
export function usePersonalSettingsPreferencesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>(PersonalSettingsPreferencesDocument, options);
        }
export type PersonalSettingsPreferencesQueryHookResult = ReturnType<typeof usePersonalSettingsPreferencesQuery>;
export type PersonalSettingsPreferencesLazyQueryHookResult = ReturnType<typeof usePersonalSettingsPreferencesLazyQuery>;
export type PersonalSettingsPreferencesSuspenseQueryHookResult = ReturnType<typeof usePersonalSettingsPreferencesSuspenseQuery>;
export type PersonalSettingsPreferencesQueryResult = Apollo.QueryResult<OperationPersonalSettingsPreferencesQuery, OperationPersonalSettingsPreferencesQueryVariables>;