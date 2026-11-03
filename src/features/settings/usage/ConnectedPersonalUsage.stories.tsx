import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { PersonalUsageDocument } from "@/infrastructure/graphql/generated"
import { graphqlUsageFixture, emptyGraphqlUsageFixture } from "@/features/usage/usageStoryFixtures"
import { ConnectedPersonalUsage } from "./ConnectedPersonalUsage"

const personalSuccessFor = (
  unit: "DECIMAL" | "BINARY",
  usageProjection = graphqlUsageFixture,
) => ({
  request: { query: PersonalUsageDocument },
  result: {
    data: {
      me: {
        id: "user-a",
        preferences: { fileSizeUnit: unit },
        usage: usageProjection,
      },
    },
  },
})
const personalSuccess = personalSuccessFor("BINARY")
const personalDecimal = personalSuccessFor("DECIMAL")
const personalEmpty = personalSuccessFor("DECIMAL", emptyGraphqlUsageFixture)
const personalLoading = { ...personalDecimal, delay: 15_000 }

const meta = {
  title: "features/settings/usage/ConnectedPersonalUsage",
  component: ConnectedPersonalUsage,
} satisfies Meta<typeof ConnectedPersonalUsage>
export default meta
type Story = StoryObj<typeof meta>


/** SC-01 / ST-04 / UN-01: Personalの取得成功とDecimal Preferenceの接続。 */
export const PersonalReady: Story = {
  name: "Interaction · Personal取得成功（Decimal）",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[personalDecimal]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect((await canvas.findAllByText("1.24 GB"))[0]).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(canvas.getByRole("table")).toHaveTextContent("HEIC / HEIF")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

/** ST-03 / SS-05: 取得成功した0件はLoadingやErrorではない。 */
export const PersonalEmpty: Story = {
  name: "Interaction · Personal確定0件",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[personalEmpty]} addTypename={false}>
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

/** SS-01: 未確定値を描画せず、共通Loaderへ遷移する。 */
export const PersonalLoading: Story = {
  name: "Interaction · Personal取得待機中",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[personalLoading]} addTypename={false}>
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

// SC-01・UN-02: PersonalのUsageと表示単位を同一Operationから取得する。
export const PersonalBinary: Story = {
  name: "Interaction · Personal UsageとBinary設定",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[personalSuccess]} addTypename={false}>
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
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(
      canvas.getByText(
        "Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。",
      ),
    ).toBeVisible()
  },
}

const personalFailure = {
  request: { query: PersonalUsageDocument },
  error: new Error("Personal Usage取得失敗"),
}

// SS-02/03: PersonalだけのQueryを現在のscopeで再取得する。
export const PersonalRetry: Story = {
  name: "Interaction · Personalの取得失敗から再取得成功",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[personalFailure, personalSuccess]} addTypename={false}>
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
      await canvas.findAllByText("4.66 GiB").then((elements) => elements[0]),
    ).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// SS-04: Personalの再取得が再失敗した場合も再試行できる。
export const PersonalRetryFailure: Story = {
  name: "Interaction · Personalの再試行後も取得失敗",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[personalFailure, personalFailure]}
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
