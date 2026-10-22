import { MockedProvider, type MockedResponse } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, waitFor, within } from "storybook/test"
import {
  BrowseGroupsDocument,
  MediaGroupSort,
  ScopeType,
  type OperationBrowseGroupsQuery,
  type OperationBrowseGroupsQueryVariables,
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
    await expect(await canvas.findByRole("button", { name: "Groupを作成" })).toBeVisible()
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
    await expect(await canvas.findByRole("button", { name: "Groupを作成" })).toBeVisible()
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
    await expect(await canvas.findByRole("button", { name: "Groupを作成" })).toBeVisible()
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
    await userEvent.click(await canvas.findByRole("button", { name: "Groupを作成" }))
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
    await expect(canvas.getByRole("button", { name: "Groupを作成" })).toBeVisible()
  },
}
