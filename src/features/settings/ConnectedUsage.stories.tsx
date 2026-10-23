import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import {
  CommunityUsageDocument,
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
    <MockedProvider mocks={[communitySuccess]} addTypename={false}>
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
    }]} addTypename={false}>
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
    <MockedProvider mocks={[communityFailure, communitySuccess]} addTypename={false}>
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
    <MockedProvider mocks={[communityFailure, communityFailure]} addTypename={false}>
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
