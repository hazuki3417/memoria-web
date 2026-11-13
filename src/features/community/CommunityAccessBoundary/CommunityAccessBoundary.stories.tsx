import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { GraphQLError } from "graphql"
import { Text } from "@mantine/core"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityDetailsDocument } from "@/infrastructure/graphql/generated"
import { CommunityAccessBoundary } from "./CommunityAccessBoundary"

const communityId = "club-a"
const request = {
  query: CommunityDetailsDocument,
  variables: { communityId },
}
const success = {
  request,
  result: {
    data: {
      community: {
        id: communityId,
        name: "家族のアルバム",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    },
  },
}
const notFound = {
  request,
  result: {
    errors: [
      new GraphQLError("not found", { extensions: { code: "NOT_FOUND" } }),
    ],
  },
}
const networkFailure = { request, error: new Error("network unavailable") }

function ProtectedCommunityStory({
  onReturnToDashboard,
  onLogin,
}: {
  onReturnToDashboard: () => void
  onLogin: () => void
}) {
  return (
    <CommunityAccessBoundary
      communityId={communityId}
      onReturnToDashboard={onReturnToDashboard}
      onLogin={onLogin}
    >
      <Text>Community固有コンテンツ</Text>
    </CommunityAccessBoundary>
  )
}

const meta = {
  title: "Features/Community/Access Boundary",
  component: ProtectedCommunityStory,
  args: {
    onReturnToDashboard: fn(),
    onLogin: fn(),
  },
} satisfies Meta<typeof ProtectedCommunityStory>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Interaction · 認可確認後にページを表示",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[success]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("Community固有コンテンツ")).toBeVisible()
  },
}

export const Loading: Story = {
  name: "Interaction · 取得中はページを表示しない",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[{ ...success, delay: 15_000 }]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole("status", {
        name: "Communityへのアクセスを確認中",
      }),
    ).toBeVisible()
    await expect(canvas.queryByText("Community固有コンテンツ")).not.toBeInTheDocument()
  },
}

export const Unavailable: Story = {
  name: "Interaction · 非所属と不存在を共通表示",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[notFound]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("このCommunityを表示できません")).toBeVisible()
    await expect(canvas.queryByText("Community固有コンテンツ")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "ダッシュボードへ戻る" }))
    await expect(args.onReturnToDashboard).toHaveBeenCalledTimes(1)
  },
}

export const Unauthenticated: Story = {
  name: "Interaction · 認証失効時にログインを案内",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[{
          request,
          result: {
            errors: [
              new GraphQLError("unauthenticated", {
                extensions: { code: "UNAUTHENTICATED" },
              }),
            ],
          },
        }]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("認証状態を確認できませんでした"),
    ).toBeVisible()
    await expect(canvas.queryByText("Community固有コンテンツ")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "ログインへ" }))
    await expect(args.onLogin).toHaveBeenCalledTimes(1)
  },
}

export const Retry: Story = {
  name: "Interaction · 通信失敗から再試行",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[networkFailure, success]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(canvas.queryByText("Community固有コンテンツ")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(await canvas.findByText("Community固有コンテンツ")).toBeVisible()
  },
}
