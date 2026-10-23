import { MockedProvider, type MockedResponse } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { GraphQLError } from "graphql"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import {
  BrowseGroupsDocument,
  BrowseGroupDetailDocument,
  BrowseGroupRelationCandidatesDocument,
  MediaStatus,
  MediaType,
  type OperationBrowseGroupDetailQuery,
  type OperationBrowseGroupRelationCandidatesQuery,
  CreateBrowserGroupDocument,
  MediaGroupSort,
  ScopeType,
  type OperationBrowseGroupsQuery,
  type OperationBrowseGroupsQueryVariables,
  type OperationCreateBrowserGroupMutation,
  type OperationCreateBrowserGroupMutationVariables,
} from "@/infrastructure/graphql/generated"
import { GroupBrowserContainer } from "./GroupBrowserContainer"

// Apollo's request boundary is mocked; the real generated hook and Container run unchanged.
const request = {
  query: BrowseGroupsDocument,
  variables: {
    scope: { type: ScopeType.Personal },
    sort: MediaGroupSort.NameAsc,
    first: 100,
  } satisfies OperationBrowseGroupsQueryVariables,
}

const emptyResult: OperationBrowseGroupsQuery = {
  mediaGroups: {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  },
}

const emptyReply: MockedResponse<OperationBrowseGroupsQuery> = {
  request,
  result: { data: emptyResult },
}
const failedReply: MockedResponse<OperationBrowseGroupsQuery> = {
  request,
  error: new Error("テスト用の通信エラー"),
}

const meta = {
  title: "Features/Group Browser/Apollo Integration",
  component: GroupBrowserContainer,
  args: { contextKind: "personal" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof GroupBrowserContainer>
export default meta
type Story = StoryObj<typeof meta>

/** GB-011: ApolloのQuery結果が空のとき、画面を通常の空状態で表示できる。 */
export const EmptyScope: Story = {
  name: "Integration · Empty Scope",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[emptyReply]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("まだGroupがありません")).toBeVisible()
    await expect(canvas.getByPlaceholderText("Groupを検索")).toBeVisible()
  },
}

/** GB-010関連: Query失敗時は明示的なErrorとRetryを提供する。 */
export const ListingError: Story = {
  name: "Integration · Listing Error",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[failedReply]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("Group一覧の取得に失敗しました。再試行できます。"),
    ).toBeVisible()
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeEnabled()
    await expect(canvas.getByPlaceholderText("Groupを検索")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "検索" })).toBeVisible()
  },
}

/** Error → Retry → Success: 実際のApollo refetchを通して回復する。 */
export const RetryAfterError: Story = {
  name: "Integration · Retry After Error",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[failedReply, emptyReply]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText("Group一覧の取得に失敗しました。再試行できます。")
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect((await canvas.findAllByRole("button", { name: "Groupを作成" }))[0]).toBeVisible()
  },
}


/** GB-010: 再試行が再び失敗してもError表示を維持し、次の明示的なRetryで回復する。 */
export const RetryFailsThenRecovers: Story = {
  name: "Integration · Retry Fails Then Recovers",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[failedReply, failedReply, emptyReply]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const message = "Group一覧の取得に失敗しました。再試行できます。"
    await canvas.findByText(message)
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await waitFor(() => {
      expect(canvas.getByRole("button", { name: "再試行" })).toBeEnabled()
      expect(canvas.getByText(message)).toBeVisible()
    })
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect((await canvas.findAllByRole("button", { name: "Groupを作成" }))[0]).toBeVisible()
    await expect(canvas.queryByText(message)).not.toBeInTheDocument()
  },
}

/** GB-011: Apollo Queryが空のScopeでも作成Dialogを開閉でき、Cancel後は一覧の空状態へ戻る。 */
export const EmptyScopeCreateCancel: Story = {
  name: "Integration · Empty Scope Create Cancel",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[emptyReply]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click((await canvas.findAllByRole("button", { name: "Groupを作成" }))[0])
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Groupを作成" }),
    )
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "未保存のGroup")
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await waitFor(() => {
      expect(
        within(document.body).queryByRole("dialog", { name: "Groupを作成" }),
      ).not.toBeInTheDocument()
    })
    await expect(canvas.getAllByRole("button", { name: "Groupを作成" })[0]).toBeVisible()
  },
}

const creationName = "Apolloで作成するGroup"
const createRequest = {
  query: CreateBrowserGroupDocument,
  variables: {
    input: {
      scope: { type: ScopeType.Personal },
      name: creationName,
      parentGroupIds: [],
      childGroupIds: [],
    },
  } satisfies OperationCreateBrowserGroupMutationVariables,
}
const createdGroup: OperationCreateBrowserGroupMutation = {
  createMediaGroup: {
    group: {
      id: "created-apollo",
      name: creationName,
      stateToken: "token-1",
      createdAt: "2026-10-22T00:00:00Z",
    },
  },
}

// Invoked only after Apollo's MockLink matches the operation and its variables.
const createSuccessReply = fn(() => ({ data: createdGroup }))
const createRejectedReply = fn(() => ({
  errors: [new GraphQLError("同名のGroupが存在します", {
    extensions: { code: "DUPLICATE_NAME" },
  })],
}))
const createUnknownReply = fn(() => ({
  errors: [new GraphQLError("作成結果を確認できません", {
    extensions: { code: "UNKNOWN_OUTCOME" },
  })],
}))

async function submitCreation(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await userEvent.click((await canvas.findAllByRole("button", { name: "Groupを作成" }))[0])
  const dialog = within(
    await within(document.body).findByRole("dialog", { name: "Groupを作成" }),
  )
  await userEvent.type(dialog.getByPlaceholderText("Group名"), creationName)
  await userEvent.click(dialog.getByRole("button", { name: "作成" }))
  return dialog
}

/** GB-030: Atomic CreateのGraphQL引数を照合し、確定成功後に一覧を再取得する。 */
export const CreateMutationSuccess: Story = {
  name: "Integration · Create Mutation Success",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          emptyReply,
          {
            request: createRequest,
            result: createSuccessReply,
          } satisfies MockedResponse<OperationCreateBrowserGroupMutation>,
          emptyReply,
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    createSuccessReply.mockClear()
    await submitCreation(canvasElement)
    await waitFor(() => {
      expect(createSuccessReply).toHaveBeenCalledTimes(1)
      expect(
        within(document.body).queryByRole("dialog", { name: "Groupを作成" }),
      ).not.toBeInTheDocument()
    })
    await expect(within(canvasElement).getByRole("button", { name: "Groupを作成" })).toBeVisible()
  },
}

/** GB-034: 確定したGraphQL業務エラーでは作成Dialogの入力を維持する。 */
export const CreateMutationRejected: Story = {
  name: "Integration · Create Mutation Rejected",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          emptyReply,
          {
            request: createRequest,
            result: createRejectedReply,
          },
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    createRejectedReply.mockClear()
    await submitCreation(canvasElement)
    await waitFor(() => {
      expect(createRejectedReply).toHaveBeenCalledTimes(1)
      expect(within(document.body).getByRole("dialog", { name: "Groupを作成" })).toBeVisible()
    })
    const dialog = within(
      within(document.body).getByRole("dialog", { name: "Groupを作成" }),
    )
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue(creationName)
    await expect(dialog.getByRole("button", { name: "作成" })).toBeEnabled()
  },
}

/** GB-035: 通信の結果不明ではDraftを維持し、自動でMutationを再送しない。 */
export const CreateMutationUnknown: Story = {
  name: "Integration · Create Mutation Unknown",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          emptyReply,
          { request: createRequest, result: createUnknownReply },
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    createUnknownReply.mockClear()
    await submitCreation(canvasElement)
    await waitFor(() => {
      expect(createUnknownReply).toHaveBeenCalledTimes(1)
      expect(within(document.body).getByRole("dialog", { name: "Groupを作成" })).toBeVisible()
    })
    const dialog = within(
      within(document.body).getByRole("dialog", { name: "Groupを作成" }),
    )
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue(creationName)
    await expect(dialog.getByRole("button", { name: "作成" })).toBeEnabled()
  },
}

/** 初回取得中も検索操作パネルが残り、正常Emptyを表示しない。 */
export const ListingLoading: Story = {
  name: "Integration · Listing Loading",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[{ ...emptyReply, delay: 3000 }]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByPlaceholderText("Groupを検索")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "検索" })).toBeVisible()
    await expect(canvas.getByText("Groupを読み込んでいます")).toBeVisible()
    await expect(canvas.queryByText("まだGroupがありません")).not.toBeInTheDocument()
  },
}

const pageOneResult: OperationBrowseGroupsQuery = {
  mediaGroups: {
    edges: [{ cursor: "cursor-a", node: {
      id: "pagination-group-a", name: "ページ1のGroup", stateToken: "1", createdAt: "2026-01-01T00:00:00Z",
    } }],
    pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: "cursor-a", endCursor: "cursor-a" },
  },
}
const pageTwoResult: OperationBrowseGroupsQuery = {
  mediaGroups: {
    edges: [
      { cursor: "cursor-a", node: { id: "pagination-group-a", name: "ページ1のGroup", stateToken: "1", createdAt: "2026-01-01T00:00:00Z" } },
      { cursor: "cursor-b", node: { id: "pagination-group-b", name: "ページ2のGroup", stateToken: "2", createdAt: "2026-01-02T00:00:00Z" } },
    ],
    pageInfo: { hasNextPage: false, hasPreviousPage: true, startCursor: "cursor-a", endCursor: "cursor-b" },
  },
}
const pageTwoRequest = {
  query: BrowseGroupsDocument,
  variables: { ...request.variables, after: "cursor-a" },
}
const pageOneReply: MockedResponse<OperationBrowseGroupsQuery> = {
  request, result: { data: pageOneResult },
}
const pageTwoReply: MockedResponse<OperationBrowseGroupsQuery> = {
  request: pageTwoRequest, result: { data: pageTwoResult },
}

/** Scrolling near the end fetches the second page, keeps the first, deduplicates, and stops at the final page. */
export const ListingPagination: Story = {
  name: "Integration · Listing Fetch More",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[pageOneReply, pageTwoReply]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("ページ1のGroup")).toBeVisible()
    await expect(await canvas.findByText("ページ2のGroup")).toBeVisible()
    await expect(canvas.getAllByText("ページ1のGroup")).toHaveLength(1)
    await expect(canvas.queryByText("追加のGroupを取得できませんでした")).not.toBeInTheDocument()
  },
}

/** The first page remains available when fetchMore fails, and an explicit retry recovers. */
export const ListingPaginationRetry: Story = {
  name: "Integration · Listing Fetch More Retry",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[
      pageOneReply,
      { request: pageTwoRequest, error: new Error("次ページの取得に失敗") },
      pageTwoReply,
    ]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("ページ1のGroup")).toBeVisible()
    await expect(await canvas.findByText("追加のGroupを取得できませんでした")).toBeVisible()
    await expect(canvas.getByText("ページ1のGroup")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(await canvas.findByText("ページ2のGroup")).toBeVisible()
    await expect(canvas.getAllByText("ページ1のGroup")).toHaveLength(1)
  },
}

const detailListingReply: MockedResponse<OperationBrowseGroupsQuery> = {
  request,
  result: { data: { mediaGroups: { ...pageOneResult.mediaGroups, pageInfo: { ...pageOneResult.mediaGroups.pageInfo, hasNextPage: false } } } },
}
const detailRequest = {
  query: BrowseGroupDetailDocument,
  variables: { id: "pagination-group-a", scope: { type: ScopeType.Personal } },
}
const detailPageTwoRequest = {
  query: BrowseGroupDetailDocument,
  variables: { ...detailRequest.variables, mediaAfter: "media-cursor-a" },
}
const itemOne = {
  cursor: "media-cursor-a",
  node: {
    id: "pagination-media-a", mediaType: MediaType.Image, status: MediaStatus.Active,
    originalFileName: "page-one-image.jpg", createdAt: "2026-01-01T00:00:00Z",
    image: { variants: [{ url: "/__dev-assets/group-browser/group-media-01.jpg" }] },
    groups: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
  },
}
const itemTwo = {
  cursor: "media-cursor-b",
  node: {
    id: "pagination-media-b", mediaType: MediaType.Image, status: MediaStatus.Active,
    originalFileName: "page-two-image.jpg", createdAt: "2026-01-02T00:00:00Z",
    image: { variants: [{ url: "/__dev-assets/group-browser/group-media-02.jpg" }] },
    groups: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
  },
}
const detailPageOneResult: OperationBrowseGroupDetailQuery = {
  mediaGroup: {
    id: "pagination-group-a", name: "ページ1のGroup", stateToken: "1", createdAt: "2026-01-01T00:00:00Z",
    parents: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
    children: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
    aggregateMedia: {
      edges: [itemOne],
      pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: "media-cursor-a", endCursor: "media-cursor-a" },
    },
  },
}
const detailPageTwoResult: OperationBrowseGroupDetailQuery = {
  mediaGroup: {
    ...detailPageOneResult.mediaGroup!,
    aggregateMedia: {
      edges: [itemOne, itemTwo],
      pageInfo: { hasNextPage: false, hasPreviousPage: true, startCursor: "media-cursor-a", endCursor: "media-cursor-b" },
    },
  },
}
const detailFirstReply: MockedResponse<OperationBrowseGroupDetailQuery> = {
  request: detailRequest,
  result: { data: detailPageOneResult },
}
const detailSecondReply: MockedResponse<OperationBrowseGroupDetailQuery> = {
  request: detailPageTwoRequest,
  result: { data: detailPageTwoResult },
}
const relationEmptyReply: MockedResponse<OperationBrowseGroupRelationCandidatesQuery> = {
  request: {
    query: BrowseGroupRelationCandidatesDocument,
    variables: { groupId: "pagination-group-a", first: 100 },
  },
  result: { data: {
    mediaGroupRelationCandidates: {
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    },
  } },
}

/** Detail media pagination uses the real Apollo container and preserves prior media. */
export const DetailMediaPagination: Story = {
  name: "Integration · Detail Media Fetch More",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[detailListingReply, detailFirstReply, detailSecondReply, relationEmptyReply]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole("button", { name: /ページ1のGroup/ }))
    await expect(await canvas.findByAltText("page-one-image.jpg")).toBeVisible()
    await expect(await canvas.findByAltText("page-two-image.jpg")).toBeVisible()
    await expect(canvas.getAllByAltText("page-one-image.jpg")).toHaveLength(1)
  },
}

/** A failed detail page must retain existing Media until an explicit retry succeeds. */
export const DetailMediaPaginationRetry: Story = {
  name: "Integration · Detail Media Fetch More Retry",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[
      detailListingReply,
      detailFirstReply,
      { request: detailPageTwoRequest, error: new Error("次ページ取得エラー") },
      detailSecondReply,
      relationEmptyReply,
    ]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole("button", { name: /ページ1のGroup/ }))
    await expect(await canvas.findByAltText("page-one-image.jpg")).toBeVisible()
    await expect(await canvas.findByText("追加のMediaを取得できませんでした")).toBeVisible()
    await expect(canvas.getByAltText("page-one-image.jpg")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(await canvas.findByAltText("page-two-image.jpg")).toBeVisible()
    await expect(canvas.getAllByAltText("page-one-image.jpg")).toHaveLength(1)
  },
}
