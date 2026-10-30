import { MockedProvider, type MockedResponse } from "@apollo/client/testing"
import { MediaDetailUrlProvider } from "@/features/media-detail/MediaDetailUrlProvider"
import type { Meta, StoryObj } from "@storybook/react"
import { GraphQLError } from "graphql"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import {
  BrowseGroupsDocument,
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
  // Containers use the same URL context that ApplicationShell provides in production.
  decorators: [(Story) => <MediaDetailUrlProvider><Story /></MediaDetailUrlProvider>],
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
      await canvas.findByText(
        "Group一覧の取得に失敗しました。再試行できます。",
      ),
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
    await expect(
      (await canvas.findAllByRole("button", { name: "Groupを作成" }))[0],
    ).toBeVisible()
  },
}

/** GB-010: 再試行が再び失敗してもError表示を維持し、次の明示的なRetryで回復する。 */
export const RetryFailsThenRecovers: Story = {
  name: "Integration · Retry Fails Then Recovers",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[failedReply, failedReply, emptyReply]}
        addTypename={false}
      >
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
    await expect(
      (await canvas.findAllByRole("button", { name: "Groupを作成" }))[0],
    ).toBeVisible()
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
    await userEvent.click(
      (await canvas.findAllByRole("button", { name: "Groupを作成" }))[0],
    )
    const dialog = within(
      await within(document.body).findByRole("dialog", { name: "Groupを作成" }),
    )
    await userEvent.type(
      dialog.getByPlaceholderText("Group名"),
      "未保存のGroup",
    )
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await waitFor(() => {
      expect(
        within(document.body).queryByRole("dialog", { name: "Groupを作成" }),
      ).not.toBeInTheDocument()
    })
    await expect(
      canvas.getAllByRole("button", { name: "Groupを作成" })[0],
    ).toBeVisible()
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
  errors: [
    new GraphQLError("同名のGroupが存在します", {
      extensions: { code: "DUPLICATE_NAME" },
    }),
  ],
}))
const createUnknownReply = fn(() => ({
  errors: [
    new GraphQLError("作成結果を確認できません", {
      extensions: { code: "UNKNOWN_OUTCOME" },
    }),
  ],
}))

async function submitCreation(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await userEvent.click(
    (await canvas.findAllByRole("button", { name: "Groupを作成" }))[0],
  )
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
    await expect(
      within(canvasElement).getAllByRole("button", { name: "Groupを作成" })[0],
    ).toBeVisible()
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
      expect(
        within(document.body).getByRole("dialog", { name: "Groupを作成" }),
      ).toBeVisible()
    })
    const dialog = within(
      within(document.body).getByRole("dialog", { name: "Groupを作成" }),
    )
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue(
      creationName,
    )
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
      expect(
        within(document.body).getByRole("dialog", { name: "Groupを作成" }),
      ).toBeVisible()
    })
    const dialog = within(
      within(document.body).getByRole("dialog", { name: "Groupを作成" }),
    )
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue(
      creationName,
    )
    await expect(dialog.getByRole("button", { name: "作成" })).toBeEnabled()
  },
}

/** 初回取得中も検索操作パネルが残り、正常Emptyを表示しない。 */
export const ListingLoading: Story = {
  name: "Integration · Listing Loading",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[{ ...emptyReply, delay: 3000 }]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByPlaceholderText("Groupを検索")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "検索" })).toBeVisible()
    await expect(canvas.getByText("Groupを読み込んでいます")).toBeVisible()
    await expect(
      canvas.queryByText("まだGroupがありません"),
    ).not.toBeInTheDocument()
  },
}
