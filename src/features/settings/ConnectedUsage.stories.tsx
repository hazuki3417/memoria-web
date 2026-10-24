import { MockedProvider } from "@apollo/client/testing"
import { Button } from "@mantine/core"
import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import {
  CommunityUsageDocument,
  CurrentUserDocument,
  PersonalUsageDocument,
} from "@/infrastructure/graphql/generated"
import { ConnectedUsage } from "./ConnectedUsage"

const usage = {
  mediaCount: 1248,
  storage: { usedBytes: "1240000000", effectiveLimitBytes: "5000000000" },
  formatBreakdown: [
    { format: "JPEG", mediaCount: 900, usedBytes: "900000000" },
    { format: "PNG", mediaCount: 200, usedBytes: "200000000" },
    { format: "WEBP", mediaCount: 100, usedBytes: "100000000" },
    { format: "HEIF", mediaCount: 48, usedBytes: "40000000" },
  ],
}

const communityRequest = {
  query: CommunityUsageDocument,
  variables: { communityId: "club-a" },
}
const communitySuccess = {
  request: communityRequest,
  result: { data: { communityUsage: usage } },
}
const communityFailure = {
  request: communityRequest,
  error: new Error("Usage取得失敗"),
}

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

const personalSuccess = {
  request: { query: PersonalUsageDocument },
  result: {
    data: {
      me: {
        id: "user-a",
        preferences: { fileSizeUnit: "BINARY" },
        usage,
      },
    },
  },
}

// NV-04: 同一画面でCommunity IDが変わっても別Communityの集計値を表示しない。
function CommunitySwitchScenario() {
  const [communityId, setCommunityId] = useState("club-a")
  return (
    <>
      <Button onClick={() => setCommunityId("club-b")}>Community Bへ切り替え</Button>
      <ConnectedUsage scope="community" communityId={communityId} />
    </>
  )
}

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

const meta = {
  title: "Features/Settings/Usage/Apollo Integration",
  component: ConnectedUsage,
  args: { scope: "community", communityId: "club-a" },
} satisfies Meta<typeof ConnectedUsage>
export default meta
type Story = StoryObj<typeof meta>

// SC-02・ST-04・FM-01: Apolloの実HookとAdapterを通したCommunity Usage表示。
export const CommunityReady: Story = {
  name: "Integration · Communityの取得成功",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[communitySuccess, communityPreferences("DECIMAL")]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("1.24 GB ( 24.8 % )")).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(canvas.getByRole("table")).toHaveTextContent("HEIC / HEIF")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// UN-02: Community Usageも現在のUser Preferencesに従いBinaryで表示する。
export const CommunityBinary: Story = {
  name: "Integration · CommunityのBinary表示",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[communitySuccess, communityPreferences("BINARY")]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("4.66 GiB ( 100 % )")).toBeVisible()
    await expect(canvas.getByText("1.15 GiB ( 24.8 % )")).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// ST-03・SS-05: APIが全形式の0件行を返しても既存のEmpty UXを維持する。
export const CommunityEmpty: Story = {
  name: "Integration · 確定0件",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[{
      request: communityRequest,
      result: {
        data: {
          communityUsage: {
            mediaCount: 0,
            storage: { usedBytes: "0", effectiveLimitBytes: "5000000000" },
            formatBreakdown: usage.formatBreakdown.map((item) => ({
              ...item, mediaCount: 0, usedBytes: "0",
            })),
          },
        },
      },
    }, communityPreferences("DECIMAL")]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("登録済みのオリジナルファイルはありません")).toBeVisible()
    await expect(canvas.getAllByText("5 GB ( 100 % )")).toHaveLength(2)
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// SS-02/03: GraphQLの通信失敗から、同じOperationのrefetchで復旧する。
export const CommunityRetry: Story = {
  name: "Integration · Errorから再取得成功",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[communityFailure, communitySuccess, communityPreferences("DECIMAL")]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toHaveTextContent("利用状況を取得できませんでした")
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(await canvas.findByText("1.24 GB ( 24.8 % )")).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// SS-04: 同じGraphQL失敗が再発しても、再試行Actionを失わない。
export const CommunityRetryFailure: Story = {
  name: "Integration · 再試行して再失敗",
  tags: ["interaction"],
  decorators: [(Story) => (
    <MockedProvider mocks={[communityFailure, communityFailure, communityPreferences("DECIMAL")]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeEnabled()
  },
}

// NV-04: Communityを切り替えたときApolloがIDに対応するUsageだけを表示する。
export const CommunitySwitch: Story = {
  name: "Integration · Community AからBへの切り替え",
  tags: ["interaction"],
  render: () => <CommunitySwitchScenario />,
  decorators: [(Story) => (
    <MockedProvider mocks={[
      communitySuccess,
      { request: { query: CommunityUsageDocument, variables: { communityId: "club-b" } },
        result: { data: { communityUsage: otherCommunityUsage } } },
      communityPreferences("DECIMAL"),
    ]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("1.24 GB ( 24.8 % )")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "Community Bへ切り替え" }))
    await expect(await canvas.findByText("2 GB ( 40 % )")).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1 件")
    await expect(canvas.queryByText("1.24 GB ( 24.8 % )")).not.toBeInTheDocument()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// SC-01・UN-02: PersonalのUsageと表示単位を同一Operationから取得する。
export const PersonalBinary: Story = {
  name: "Integration · Personal UsageとBinary設定",
  tags: ["interaction"],
  args: { scope: "personal", communityId: undefined },
  decorators: [(Story) => (
    <MockedProvider mocks={[personalSuccess]} addTypename={false}>
      <Story />
    </MockedProvider>
  )],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText("4.66 GiB ( 100 % )")).toBeVisible()
    await expect(canvas.getByText("1.15 GiB ( 24.8 % )")).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(canvas.getByText("Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。")).toBeVisible()
  },
}
