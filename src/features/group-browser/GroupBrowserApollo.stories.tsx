import { MockedProvider, type MockedResponse } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
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
