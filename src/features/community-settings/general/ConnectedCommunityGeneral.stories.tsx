import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { CommunitySettingsGeneralDocument } from "@/infrastructure/graphql/generated"
import { SettingsSectionHost } from "@/ui/SettingsSectionHost"
import { ConnectedCommunityGeneral } from "./ConnectedCommunityGeneral"

/** Production General Controller and its Section-scoped Query. */
function ConnectedCommunityGeneralStory() {
  return (
    <SettingsSectionHost label="Community設定を読み込み中">
      {(render) => (
        <ConnectedCommunityGeneral communityId="club-a" render={render} />
      )}
    </SettingsSectionHost>
  )
}

const request = {
  query: CommunitySettingsGeneralDocument,
  variables: { communityId: "club-a" },
}
const generalSuccess = {
  request,
  result: {
    data: {
      community: { id: "club-a", name: "家族のアルバム" },
      communityMembers: [
        { userId: "user-a", role: "admin" },
        { userId: "user-b", role: "member" },
      ],
      me: { id: "user-a" },
    },
  },
}
const generalMember = {
  request,
  result: {
    data: {
      community: { id: "club-a", name: "家族のアルバム" },
      communityMembers: [
        { userId: "user-a", role: "admin" },
        { userId: "user-b", role: "member" },
      ],
      me: { id: "user-b" },
    },
  },
}
const generalFailure = {
  request,
  error: new Error("Community General取得失敗"),
}
const generalLoading = { ...generalSuccess, delay: 15_000 }

const meta = {
  title: "features/community-settings/general/ConnectedCommunityGeneral",
  component: ConnectedCommunityGeneralStory,
} satisfies Meta<typeof ConnectedCommunityGeneralStory>
export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Interaction · Section専用QueryからCommunity名と管理権限を表示",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[generalSuccess]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole("textbox", { name: /Community名/ }),
    ).toHaveValue("家族のアルバム")
    await expect(
      canvas.getByRole("link", { name: "Communityを削除する" }),
    ).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const MemberReadOnly: Story = {
  name: "Interaction · 一般Memberには変更操作を提供しない",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[generalMember]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole("textbox", { name: /Community名/ }),
    ).toBeDisabled()
    await expect(
      canvas.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument()
    await expect(
      canvas.queryByRole("link", { name: "Communityを削除する" }),
    ).not.toBeInTheDocument()
  },
}

export const Loading: Story = {
  name: "Interaction · 初回取得中はCommunity名フォームを表示しない",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[generalLoading]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole(
        "status",
        { name: "Community設定を読み込み中" },
        { timeout: 5_000 },
      ),
    ).toBeVisible()
    await expect(
      canvas.queryByRole("textbox", { name: /Community名/ }),
    ).not.toBeInTheDocument()
  },
}

export const ErrorRetry: Story = {
  name: "Interaction · 取得失敗後に共通Hostから再試行",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[generalFailure, generalSuccess]}
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
      canvas.queryByRole("textbox", { name: /Community名/ }),
    ).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(
      await canvas.findByRole("textbox", { name: /Community名/ }),
    ).toHaveValue("家族のアルバム")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}
