import { MockedProvider } from "@apollo/client/testing"
import { GraphQLError } from "graphql"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { PersonalSettingsProfileDocument, UpdateMemoriaUserProfileDocument } from "@/infrastructure/graphql/generated"
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


/** The real Feature -> generated Apollo Mutation -> Outcome -> Form path. */
const mutationRequest = {
  query: UpdateMemoriaUserProfileDocument,
  variables: { input: { nickname: "変更した名前" } },
}

const saveSuccess = {
  request: mutationRequest,
  result: {
    data: {
      updateUserProfile: {
        __typename: "UpdateUserProfileSuccess",
        user: { id: "user-a", profile: { nickname: "変更した名前" } },
      },
    },
  },
}
const profileAfterSave = {
  request,
  result: {
    data: {
      me: { id: "user-a", profile: { nickname: "変更した名前" } },
    },
  },
}
const saveValidation = {
  request: mutationRequest,
  result: {
    data: {
      updateUserProfile: {
        __typename: "InputValidationFailure",
        violations: [
          { scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["nickname"] }] },
        ],
      },
    },
  },
}
const saveMissingResult = {
  request: mutationRequest,
  result: { data: { updateUserProfile: null } },
}
const saveBlocked = {
  request: mutationRequest,
  result: {
    errors: [new GraphQLError("Operation is blocked", { extensions: { code: "USER_DELETING" } })],
  },
}
const saveUnknown = {
  request: mutationRequest,
  error: new Error("transport response unavailable"),
}

export const MutationSuccess: Story = {
  name: "Integration · Typed Successから保存済み状態へ",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[profileSuccess, saveSuccess, profileAfterSave]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled(),
    )
    await expect(input).toHaveValue("変更した名前")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const MutationTypedValidation: Story = {
  name: "Integration · Typed ValidationをField Errorへ反映",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[profileSuccess, saveValidation]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByText("文字数が上限を超えています。")).toBeVisible()
    await expect(input).toHaveValue("変更した名前")
  },
}

export const MutationTransportUnknown: Story = {
  name: "Integration · 通信結果不明では自動再送しない",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[profileSuccess, saveUnknown]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "プロフィールの保存結果を確認できませんでした",
    )
    await expect(input).toBeEnabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "現在の状態を確認" })).toBeEnabled()
  },
}


export const MutationMissingTypedResult: Story = {
  name: "Integration · Typed Result欠落でも成功と誤判定しない",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[profileSuccess, saveMissingResult]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "プロフィールの保存結果を確認できませんでした",
    )
    await expect(input).toHaveValue("変更した名前")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}


export const MutationBlocked: Story = {
  name: "Integration · APIのBlockedでは編集と再送を停止",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[profileSuccess, saveBlocked]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "アカウントの削除処理中です",
    )
    await expect(input).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}


export const MutationCanonicalNickname: Story = {
  name: "Integration · 保存レスポンスの確定値をRHF Baselineに採用",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          profileSuccess,
          {
            request: mutationRequest,
            result: {
              data: {
                updateUserProfile: {
                  __typename: "UpdateUserProfileSuccess",
                  user: {
                    id: "user-a",
                    profile: { nickname: "サーバーで確定した名前" },
                  },
                },
              },
            },
          },
          {
            request,
            result: {
              data: {
                me: {
                  id: "user-a",
                  profile: { nickname: "サーバーで確定した名前" },
                },
              },
            },
          },
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await waitFor(() => expect(input).toHaveValue("サーバーで確定した名前"))
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}
