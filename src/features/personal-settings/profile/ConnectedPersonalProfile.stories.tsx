import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { PersonalSettingsProfileDocument } from "@/infrastructure/graphql/generated"
import { SettingsSectionHost } from "@/ui/SettingsSectionHost"
import { ConnectedPersonalProfile } from "./ConnectedPersonalProfile"

/**
 * Production connection: Profile owns its network-only Query and supplies one
 * Section result to the common Host. No unrelated Settings Query is mocked.
 */
function ConnectedPersonalProfileStory() {
  return (
    <SettingsSectionHost label="Personal設定を読み込み中">
      {(render) => <ConnectedPersonalProfile render={render} />}
    </SettingsSectionHost>
  )
}

const request = { query: PersonalSettingsProfileDocument }
const profileSuccess = {
  request,
  result: {
    data: {
      me: { id: "user-a", profile: { nickname: "サーバー最新の名前" } },
    },
  },
}
const profileFailure = {
  request,
  error: new Error("プロフィール取得失敗"),
}
const profileLoading = { ...profileSuccess, delay: 15_000 }

const meta = {
  title: "features/settings/profile/ConnectedPersonalProfile",
  component: ConnectedPersonalProfileStory,
} satisfies Meta<typeof ConnectedPersonalProfileStory>
export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Interaction · Section専用Queryからの初回取得",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[profileSuccess]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole("textbox", { name: /ニックネーム/ }),
    ).toHaveValue("サーバー最新の名前")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const Loading: Story = {
  name: "Interaction · 未取得時はProfileフォームを表示しない",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[profileLoading]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole(
        "status",
        { name: "Personal設定を読み込み中" },
        { timeout: 5_000 },
      ),
    ).toBeVisible()
    await expect(
      canvas.queryByRole("textbox", { name: /ニックネーム/ }),
    ).not.toBeInTheDocument()
  },
}

export const ErrorRetry: Story = {
  name: "Interaction · 取得失敗から共通Hostで再試行",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[profileFailure, profileSuccess]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(
      canvas.queryByRole("textbox", { name: /ニックネーム/ }),
    ).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(
      await canvas.findByRole("textbox", { name: /ニックネーム/ }),
    ).toHaveValue("サーバー最新の名前")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}
