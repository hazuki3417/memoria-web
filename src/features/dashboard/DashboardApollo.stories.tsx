import { MockedProvider, type MockedResponse } from "@apollo/client/testing"
import { MediaDetailUrlProvider } from "@/features/media-detail/MediaDetailUrlProvider"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, waitFor, within } from "storybook/test"
import {
  DashboardRecentGroupsDocument,
  DashboardRecentMediaDocument,
  ScopeType,
} from "@/infrastructure/graphql/generated"
import { DashboardContainer } from "./DashboardContainer"

const scope = { type: ScopeType.Personal }
const requestMedia = {
  query: DashboardRecentMediaDocument,
  variables: { scope },
}
const requestGroups = {
  query: DashboardRecentGroupsDocument,
  variables: { scope },
}
const mediaResult = {
  mediaList: {
    edges: [
      {
        node: {
          id: "media-1",
          image: {
            variants: [
              { url: "/__dev-assets/media-browser/h-01.png", width: 320 },
            ],
          },
        },
      },
    ],
  },
}
const groupResult = {
  mediaGroups: {
    edges: [
      {
        node: {
          id: "group-1",
          name: "旅行",
          media: { edges: [], pageInfo: { hasNextPage: false } },
        },
      },
    ],
  },
}
const emptyMediaResult = { mediaList: { edges: [] } }
const emptyGroupResult = { mediaGroups: { edges: [] } }
const response = (
  request: MockedResponse["request"],
  data: Record<string, unknown>,
): MockedResponse => ({
  request,
  result: { data },
})
const meta = {
  title: "Features/Dashboard/Apollo Integration",
  component: DashboardContainer,
  args: { contextKind: "personal" },
  // Containers use the same URL context that ApplicationShell provides in production.
  decorators: [
    (Story) => (
      <MediaDetailUrlProvider>
        <Story />
      </MediaDetailUrlProvider>
    ),
  ],
} satisfies Meta<typeof DashboardContainer>
export default meta
type Story = StoryObj<typeof meta>

/** Real scoped Apollo hooks, with only their network boundary mocked. */
export const PopulatedPersonal: Story = {
  name: "Populated Personal",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          response(requestMedia, mediaResult),
          response(requestGroups, groupResult),
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("旅行")).toBeVisible()
    await expect(
      canvas.getAllByRole("link", { name: "すべて見る" }),
    ).toHaveLength(2)
    await expect(
      canvas.queryByText("メディアはまだありません"),
    ).not.toBeInTheDocument()
  },
}

export const EmptyPersonal: Story = {
  name: "Empty Personal",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          response(requestMedia, emptyMediaResult),
          response(requestGroups, emptyGroupResult),
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("メディアはまだありません"),
    ).toBeVisible()
    await expect(canvas.getByText("Groupはまだありません")).toBeVisible()
  },
}

export const RetryMedia: Story = {
  name: "Media Error and Retry",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          { request: requestMedia, error: new Error("temporary failure") },
          response(requestMedia, mediaResult),
          response(requestGroups, groupResult),
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("メディアを取得できませんでした"),
    ).toBeVisible()
    await expect(canvas.getByText("旅行")).toBeVisible()
    await canvas.getByRole("button", { name: "再試行" }).click()
    await waitFor(() =>
      expect(canvas.getAllByRole("link", { name: "すべて見る" })).toHaveLength(
        2,
      ),
    )
    await expect(
      canvas.queryByText("メディアを取得できませんでした"),
    ).not.toBeInTheDocument()
  },
}
