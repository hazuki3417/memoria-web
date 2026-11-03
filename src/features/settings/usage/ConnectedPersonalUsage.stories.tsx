import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { PersonalUsageDocument } from "@/infrastructure/graphql/generated"
import { ConnectedPersonalUsage } from "./ConnectedPersonalUsage"

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
  component: ConnectedPersonalUsage,
} satisfies Meta<typeof ConnectedPersonalUsage>
export default meta
type Story = StoryObj<typeof meta>

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
