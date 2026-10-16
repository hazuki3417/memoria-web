/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

export type Community = {
  __typename?: 'Community';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  createCommunity: CreateCommunityPayload;
  registerUser: RegisterUserPayload;
  updateUserPreferences: UpdateUserPreferencesPayload;
  updateUserProfile: UpdateUserProfilePayload;
};


export type MutationCreateCommunityArgs = {
  input: CreateCommunityInput;
};


export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
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
  me?: Maybe<User>;
};

export type RegisterUserInput = {
  nickname: Scalars['String']['input'];
};

export type RegisterUserPayload = {
  __typename?: 'RegisterUserPayload';
  user: User;
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
