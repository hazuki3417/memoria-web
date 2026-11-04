import { useState } from "react"
import { Button } from "@mantine/core"
import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import {
  CommunityUsageDocument,
  CurrentUserDocument,
} from "@/infrastructure/graphql/generated"
import { ConnectedCommunityUsage } from "./ConnectedCommunityUsage"
import { graphqlUsageFixture, emptyGraphqlUsageFixture } from "@/features/usage/usageStoryFixtures"


const communityRequest = {
  query: CommunityUsageDocument,
  variables: { communityId: "club-a" },
}
const communitySuccess = {
  request: communityRequest,
  result: { data: { communityUsage: graphqlUsageFixture } },
}
const communityFailure = {
  request: communityRequest,
  error: new Error("Usage取得失敗"),
}
const communityEmptySuccess = {
  request: communityRequest,
  result: { data: { communityUsage: emptyGraphqlUsageFixture } },
}
const communityLoading = { ...communitySuccess, delay: 15_000 }

const communityPreferences = (unit: "DECIMAL" | "BINARY") => ({
  request: { query: CurrentUserDocument },
  result: {
    data: {
      me: {
        id: "user-a",
        profile: { nickname: "ユーザー" },
        preferences: {
          personalAccentColor: "#0000FF",
          dateFormat: "YYYY_MM_DD",
          fileSizeUnit: unit,
          mediaThumbnailSize: "MEDIUM",
          mediaDetailNavigationWrap: false,
          mediaDetailInitialInfoWide: true,
          mediaDetailInitialInfoMedium: false,
        },
      },
    },
  },
})

// NV-04: 同一画面でCommunity IDが変わっても別Communityの集計値を表示しない。
const otherCommunityUsage = {
  mediaCount: 1,
  storage: { usedBytes: "2000000000", effectiveLimitBytes: "5000000000" },
  formatBreakdown: [
    { format: "JPEG", mediaCount: 1, usedBytes: "2000000000" },
    { format: "PNG", mediaCount: 0, usedBytes: "0" },
    { format: "WEBP", mediaCount: 0, usedBytes: "0" },
    { format: "HEIF", mediaCount: 0, usedBytes: "0" },
  ],
}


function CommunitySwitchScenario() {
  const [communityId, setCommunityId] = useState("club-a")
  return (
    <>
      <Button onClick={() => setCommunityId("club-b")}>Community Bへ切り替え</Button>
      <ConnectedCommunityUsage communityId={communityId} />
    </>
  )
}

const meta = {
  title: "features/community-settings/usage/ConnectedCommunityUsage",
  component: ConnectedCommunityUsage,
  args: { communityId: "club-a" },
} satisfies Meta<typeof ConnectedCommunityUsage>
export default meta
type Story = StoryObj<typeof meta>

// SC-02・ST-04・FM-01: Apolloの実HookとAdapterを通したCommunity Usage表示。
export const CommunityReady: Story = {
  name: "Interaction · Communityの取得成功",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[communitySuccess, communityPreferences("DECIMAL")]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      (await canvas.findAllByText("1.24 GB")).length,
    ).toBeGreaterThan(0)
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(canvas.getByRole("table")).toHaveTextContent("HEIC / HEIF")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// UN-02: Community Usageも現在のUser Preferencesに従いBinaryで表示する。
export const CommunityBinary: Story = {
  name: "Interaction · CommunityのBinary表示",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[communitySuccess, communityPreferences("BINARY")]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findAllByText("4.66 GiB").then((elements) => elements[0]),
    ).toBeVisible()
    await expect(canvas.getAllByText("1.15 GiB")[0]).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// ST-03・SS-05: APIの確定0件でも4形式の0件行を表示する。
export const CommunityEmpty: Story = {
  name: "Interaction · 確定0件",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          communityEmptySuccess,
          communityPreferences("DECIMAL"),
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = await canvas.findByRole("table")
    await expect(within(table).getAllByRole("row")).toHaveLength(6)
    for (const format of ["JPEG", "PNG", "WebP", "HEIC / HEIF"]) {
      const row = within(table).getByRole("row", {
        name: new RegExp(format.replace("/", "\\/")),
      })
      await expect(row).toHaveTextContent("0 件")
      await expect(row).toHaveTextContent("0 GB")
    }
    await expect(canvas.getAllByText("5 GB")[0]).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

/** SS-01: Usage取得応答が未確定の間は共通Loaderで集計値を隠す。 */
export const CommunityLoading: Story = {
  name: "Interaction · Community取得待機中",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[communityLoading, communityPreferences("DECIMAL")]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole("status", { name: "利用状況を読み込み中" }, { timeout: 5_000 }),
    ).toBeVisible()
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument()
    await expect(canvas.queryByText("0 GB")).not.toBeInTheDocument()
  },
}

// SS-02/03: GraphQLの通信失敗から、同じOperationのrefetchで復旧する。
export const CommunityRetry: Story = {
  name: "Interaction · Errorから再取得成功",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          communityFailure,
          communitySuccess,
          communityPreferences("DECIMAL"),
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "利用状況を取得できませんでした",
    )
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(
      await canvas.findAllByText("1.24 GB").then((elements) => elements[0]),
    ).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// SS-04: 同じGraphQL失敗が再発しても、再試行Actionを失わない。
export const CommunityRetryFailure: Story = {
  name: "Interaction · 再試行して再失敗",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          communityFailure,
          communityFailure,
          communityPreferences("DECIMAL"),
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeEnabled()
  },
}

// SS-02/03・UN-02: Usageが取得できてもCurrentUser Preferencesが失敗した場合は
// 単位を推測して確定表示せず、再試行で双方を復旧してから集計を表示する。
export const CommunityPreferencesRetry: Story = {
  name: "Interaction · Preferences取得失敗から再取得成功",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          communitySuccess,
          communitySuccess,
          {
            request: { query: CurrentUserDocument },
            error: new Error("Preferences取得失敗"),
          },
          communityPreferences("BINARY"),
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "利用状況を取得できませんでした",
    )
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(
      await canvas.findAllByText("4.66 GiB").then((elements) => elements[0]),
    ).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// NV-04: Communityを切り替えたときApolloがIDに対応するUsageだけを表示する。
export const CommunitySwitch: Story = {
  name: "Interaction · Community AからBへの切り替え",
  tags: ["interaction"],
  render: () => <CommunitySwitchScenario />,
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          communitySuccess,
          {
            request: {
              query: CommunityUsageDocument,
              variables: { communityId: "club-b" },
            },
            result: { data: { communityUsage: otherCommunityUsage } },
          },
          communityPreferences("DECIMAL"),
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
      await canvas.findAllByText("1.24 GB").then((elements) => elements[0]),
    ).toBeVisible()
    await userEvent.click(canvas.getByRole("radio", { name: "割合" }))
    await expect(canvas.getByRole("radio", { name: "割合" })).toBeChecked()
    await userEvent.click(
      canvas.getByRole("button", { name: "Community Bへ切り替え" }),
    )
    await expect(
      await canvas.findAllByText("2 GB").then((elements) => elements[0]),
    ).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1 件")
    await expect(canvas.getByRole("radio", { name: "容量" })).toBeChecked()
    await expect(canvas.queryAllByText("1.24 GB")).toHaveLength(0)
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

