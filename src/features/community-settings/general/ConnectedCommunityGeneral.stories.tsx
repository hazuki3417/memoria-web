import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { GraphQLError } from "graphql"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { CommunitySettingsGeneralDocument, UpdateCommunityDocument } from "@/infrastructure/graphql/generated"
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


const mutationRequest = {
  query: UpdateCommunityDocument,
  variables: { input: { communityId: "club-a", name: "変更後のCommunity名" } },
}
const renameSuccess = {
  request: mutationRequest,
  result: {
    data: {
      updateCommunity: {
        __typename: "UpdateCommunitySuccess",
        community: {
          id: "club-a",
          name: "変更後のCommunity名",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    },
  },
}
const renameValidation = {
  request: mutationRequest,
  result: {
    data: {
      updateCommunity: {
        __typename: "InputValidationFailure",
        violations: [
          { scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["name"] }] },
        ],
      },
    },
  },
}
const renameUnknown = {
  request: mutationRequest,
  error: new Error("Transport result unavailable"),
}
const renameBlocked = {
  request: mutationRequest,
  result: {
    errors: [new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } })],
  },
}

export const MutationSuccess: Story = {
  name: "Interaction · Community名のTyped Successを確定値に反映",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[generalSuccess, renameSuccess]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await waitFor(() => expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled())
    await expect(input).toHaveValue("変更後のCommunity名")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const MutationValidation: Story = {
  name: "Interaction · Community名のTyped ValidationをFieldへ反映",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[generalSuccess, renameValidation]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("文字数が上限を超えています。")).toBeVisible()
    await expect(input).toHaveValue("変更後のCommunity名")
  },
}

export const MutationTransportUnknown: Story = {
  name: "Interaction · Community名の通信結果不明で再送を停止",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[generalSuccess, renameUnknown]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Community名の保存結果を確認できませんでした",
    )
    await expect(input).toHaveValue("変更後のCommunity名")
    await expect(input).toBeEnabled()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "現在の状態を確認" })).toBeEnabled()
  },
}

export const MutationBlocked: Story = {
  name: "Interaction · Community名の権限失効で編集と保存を停止",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[generalSuccess, renameBlocked]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "この操作を行う権限がありません",
    )
    await expect(input).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}
