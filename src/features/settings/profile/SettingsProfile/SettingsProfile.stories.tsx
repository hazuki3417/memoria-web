import { Box, Button } from "@mantine/core"
import { Notifications, notifications } from "@mantine/notifications"
import { useRef, useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { SettingsProfile } from "./SettingsProfile"
import { SettingsInputValidationError } from "../../graphqlSettingsResult"

const meta = {
  title: "features/settings/profile/SettingsProfile",
  component: SettingsProfile,
  args: {
    initialNickname: "テストユーザー",
    onSave: fn(async () => undefined),
  },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SettingsProfile>
export default meta
type Story = StoryObj<typeof meta>

export const InitiallySaving: Story = {
  name: "Interaction · 保存中も初期ニックネームを改変しない",
  tags: ["interaction"],
  args: { initialSaveState: "saving" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: /ニックネーム/ })).toHaveValue(
      "テストユーザー",
    )
    await expect(canvas.getByRole("button", { name: "更新中" })).toBeDisabled()
  },
}

export const InitiallyRetryable: Story = {
  name: "Interaction · 保存失敗状態も初期ニックネームを改変しない",
  tags: ["interaction"],
  args: { initialSaveState: "retryable-error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: /ニックネーム/ })).toHaveValue(
      "テストユーザー",
    )
    await expect(canvas.getByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeDisabled()
  },
}

function ProfileRefreshFixture(args: ComponentProps<typeof SettingsProfile>) {
  const [nickname, setNickname] = useState(args.initialNickname ?? "テストユーザー")
  return (
    <>
      <Button onClick={() => setNickname("サーバー更新後の名前")}>
        プロフィール再取得を再現
      </Button>
      <SettingsProfile {...args} initialNickname={nickname} />
    </>
  )
}

export const RefreshWhileUntouched: Story = {
  name: "Interaction · 未編集ならプロフィールの更新値を反映",
  tags: ["interaction"],
  render: (args) => <ProfileRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "プロフィール再取得を再現" }))
    await expect(canvas.getByRole("textbox", { name: /ニックネーム/ })).toHaveValue(
      "サーバー更新後の名前",
    )
  },
}

export const RefreshWhileEditing: Story = {
  name: "Interaction · 編集中はプロフィールのDraftを保護",
  tags: ["interaction"],
  render: (args) => <ProfileRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中の名前")
    await userEvent.click(canvas.getByRole("button", { name: "プロフィール再取得を再現" }))
    await expect(input).toHaveValue("編集中の名前")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeEnabled()
  },
}

export const Profile: Story = {
  name: "Visual · プロフィール",
  tags: ["visual"],
}

export const ProfileInitialContent: Story = {
  name: "Interaction · 見出し・説明・初期値・未変更状態",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("heading", { name: "プロフィール" })).toBeVisible()
    await expect(canvas.getByText("プロフィール情報を変更します。")).toBeVisible()
    await expect(canvas.getByText("基本情報")).toBeVisible()
    await expect(canvas.getByText("Memoriaで表示する名前です。")).toBeVisible()
    await expect(canvas.getByRole("textbox", { name: /ニックネーム/ })).toHaveValue(
      "テストユーザー",
    )
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}

export const ProfileInitiallyBlocked: Story = {
  name: "Interaction · 初期Blockedの説明と操作停止",
  tags: ["interaction"],
  args: { initialSaveState: "blocked" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "プロフィールを変更できません",
    )
    await expect(canvas.getByRole("textbox", { name: /ニックネーム/ })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}

/** Confirms Profile delegates persistence while keeping the existing form interaction. */
export const ProfileSaveContract: Story = {
  name: "Interaction · プロフィール保存",
  tags: ["interaction"],
  args: { onSave: fn(async () => undefined) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(args.onSave).toHaveBeenCalledWith("変更後の名前")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}

export const ProfileValidationContract: Story = {
  name: "Interaction · ニックネーム必須",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(canvas.getByRole("textbox", { name: /ニックネーム/ }))
    await expect(canvas.queryByText("ニックネームを入力してください。")).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await userEvent.tab()
    await expect(
      canvas.getByText("ニックネームを入力してください。"),
    ).toBeVisible()
    await userEvent.type(canvas.getByRole("textbox", { name: /ニックネーム/ }), "修正済み")
    await expect(canvas.queryByText("ニックネームを入力してください。")).not.toBeInTheDocument()
    // Once touched, another invalid edit must be reported without a second blur.
    await userEvent.clear(canvas.getByRole("textbox", { name: /ニックネーム/ }))
    await expect(canvas.getByText("ニックネームを入力してください。")).toBeVisible()
  },
}

export const ProfileSaveFailed: Story = {
  name: "Interaction · 保存失敗と再試行",
  tags: ["interaction"],
  args: {
    onSave: fn()
      .mockRejectedValueOnce({ kind: "retryable" })
      .mockResolvedValue(undefined),
  },
  play: async ({ canvasElement, args }) => {
    args.onSave?.mockReset()
    args.onSave?.mockRejectedValueOnce({ kind: "retryable" })
    args.onSave?.mockResolvedValue(undefined)
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(input).toHaveValue("変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(args.onSave).toHaveBeenCalledTimes(2)
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const ProfileServerFieldValidation: Story = {
  name: "Interaction · API Field ValidationをRHFに反映",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw new SettingsInputValidationError([
        { scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["nickname"] }] },
      ])
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByText("文字数が上限を超えています。")).toBeVisible()
    await expect(input).toHaveValue("変更した名前")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const ProfileUnknownOutcome: Story = {
  name: "Interaction · Unknown照会一致で明示確認・二重送信なし",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => { throw new Error("network timeout") }),
    onInspect: fn(async () => "変更した名前"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "プロフィールの保存結果を確認できませんでした",
    )
    await expect(input).toHaveValue("変更した名前")
    await expect(input).toBeEnabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)

    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(args.onInspect).toHaveBeenCalledTimes(1)
    await expect(await canvas.findByRole("button", { name: "確認完了" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "元の保存処理が成功した証明ではありません",
    )
    await userEvent.click(canvas.getByRole("button", { name: "確認完了" }))
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(input).toHaveValue("変更した名前")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const ProfileSaveBlocked: Story = {
  name: "Interaction · 保存不可の状態",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw { kind: "blocked" }
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(input).toBeDisabled()
  },
}

export const ProfileUnchanged: Story = {
  name: "Interaction · 変更なしで保存不可",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}

export const ProfileTrimmedUnchanged: Story = {
  name: "Interaction · 前後の空白のみの変更は保存不可",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, " テストユーザー ")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}


// The unresolved Promise represents an actual in-flight mutation. Neither
// refetches nor repeated clicks may rewrite its editable draft.
function ProfileInFlightFixture(args: ComponentProps<typeof SettingsProfile>) {
  const [nickname, setNickname] = useState(args.initialNickname ?? "テストユーザー")
  const resolveSave = useRef<(() => void) | null>(null)
  return (
    <>
      <Button onClick={() => setNickname("保存中に再取得した名前")}>
        保存中に再取得を再現
      </Button>
      <Button onClick={() => resolveSave.current?.()}>保存応答を返す</Button>
      <SettingsProfile
        {...args}
        initialNickname={nickname}
        onSave={() =>
          new Promise<void>((resolve) => {
            resolveSave.current = resolve
          })
        }
      />
    </>
  )
}

export const ProfileInFlightContract: Story = {
  name: "Interaction · 保存中の入力停止と遅延再取得時のDraft保護",
  tags: ["interaction"],
  render: (args) => <ProfileInFlightFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "保存待ちの名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(canvas.getByRole("button", { name: "更新中" })).toBeDisabled()
    await expect(input).toBeDisabled()
    await userEvent.click(canvas.getByRole("button", { name: "保存中に再取得を再現" }))
    await expect(input).toHaveValue("保存待ちの名前")
    await userEvent.click(canvas.getByRole("button", { name: "保存応答を返す" }))
    await waitFor(() => expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled())
    await expect(input).toBeEnabled()
    await expect(input).toHaveValue("保存待ちの名前")
  },
}

export const ProfileNormalizedSave: Story = {
  name: "Interaction · Trim後の名前のみ送信・確定",
  tags: ["interaction"],
  args: { onSave: fn(async () => undefined) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "  更新後の名前  ")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(args.onSave).toHaveBeenCalledExactlyOnceWith("更新後の名前")
    await waitFor(() => expect(input).toHaveValue("更新後の名前"))
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}

export const ProfileServerFormValidation: Story = {
  name: "Interaction · API Form ValidationはFieldへ誤帰属しない",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw new SettingsInputValidationError([
        { scope: "FORM", code: "INVALID_COMBINATION", inputPaths: [] },
      ])
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "入力内容を確認してください",
    )
    await expect(input).toHaveValue("変更した名前")
    await expect(input).not.toHaveAttribute("aria-invalid", "true")
    await expect(args.onSave).toHaveBeenCalledTimes(1)
    await userEvent.type(input, "再編集")
    await expect(canvas.getByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeEnabled()
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(args.onSave).toHaveBeenCalledTimes(2)
    await expect(canvas.getByRole("alert")).toBeVisible()
  },
}

export const ProfileGraphqlDeletingBlocked: Story = {
  name: "Interaction · GraphQL USER_DELETINGはBlocked",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw { graphQLErrors: [{ extensions: { code: "USER_DELETING" } }] }
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "アカウントの削除処理中です",
    )
    await expect(input).toHaveValue("変更した名前")
    await expect(input).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const ProfileGraphqlInternalUnknown: Story = {
  name: "Interaction · GraphQL INTERNAL後は照会不一致で明示復旧",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw { graphQLErrors: [{ extensions: { code: "INTERNAL" } }] }
    }),
    onInspect: fn(async () => "現在のサーバー値"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "プロフィールの保存結果を確認できませんでした",
    )
    await expect(input).toBeEnabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)

    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "もう一度保存" })).toBeEnabled()
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "現在のサーバー値",
    )
    await expect(canvas.getByRole("button", { name: "変更を破棄" })).toBeVisible()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const ProfileRefreshAfterRevert: Story = {
  name: "Interaction · 編集を元に戻した後は再取得へ追従",
  tags: ["interaction"],
  render: (args) => <ProfileRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    const save = canvas.getByRole("button", { name: "更新" })
    await userEvent.clear(input)
    await userEvent.type(input, "一時的な名前")
    await expect(save).toBeEnabled()
    await userEvent.clear(input)
    await userEvent.type(input, "テストユーザー")
    await expect(save).toBeDisabled()
    await userEvent.click(canvas.getByRole("button", { name: "プロフィール再取得を再現" }))
    await expect(input).toHaveValue("サーバー更新後の名前")
    await expect(save).toBeDisabled()
  },
}


export const ProfileUnknownInspectFailure: Story = {
  name: "Interaction · Unknown照会失敗はDraft保持と再照会のみ",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => { throw new Error("request result missing") }),
    onInspect: fn(async () => { throw new Error("read failed") }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "保存できたか不明")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByText("現在のプロフィールを取得できませんでした。保存操作は再送せず、状態の確認をやり直してください。")).toBeVisible()
    await expect(input).toHaveValue("保存できたか不明")
    await expect(canvas.queryByRole("button", { name: "もう一度保存" })).not.toBeInTheDocument()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
    await expect(args.onInspect).toHaveBeenCalledTimes(1)
  },
}

export const ProfileUnknownDiscard: Story = {
  name: "Interaction · 不一致の現在値を選んでDraftを破棄",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => { throw new Error("uncertain") }),
    onInspect: fn(async () => "確認した現在値"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定の入力")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "変更を破棄" })).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "変更を破棄" }))
    await expect(input).toHaveValue("確認した現在値")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const ProfileUnknownExplicitRetry: Story = {
  name: "Interaction · 照会不一致のあと手動で一度だけ再保存",
  tags: ["interaction"],
  args: {
    onSave: fn()
      .mockRejectedValueOnce(new Error("uncertain"))
      .mockResolvedValue(undefined),
    onInspect: fn(async () => "以前の名前"),
  },
  play: async ({ canvasElement, args }) => {
    args.onSave?.mockReset()
    args.onSave?.mockRejectedValueOnce(new Error("uncertain"))
    args.onSave?.mockResolvedValue(undefined)
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "もう一度保存する名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "もう一度保存" })).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "もう一度保存" }))
    await expect(args.onSave).toHaveBeenCalledTimes(2)
    await expect(args.onSave).toHaveBeenLastCalledWith("もう一度保存する名前")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}

function PendingInspectionFixture(args: ComponentProps<typeof SettingsProfile>) {
  const resolveInspection = useRef<((value: string) => void) | null>(null)
  return (
    <>
      <Button onClick={() => resolveInspection.current?.("古い照会結果")}>
        遅延照会を返す
      </Button>
      <SettingsProfile
        {...args}
        onSave={async () => { throw new Error("uncertain") }}
        onInspect={() =>
          new Promise<string>((resolve) => {
            resolveInspection.current = resolve
          })
        }
      />
    </>
  )
}

export const ProfileUnknownStaleInspection: Story = {
  name: "Interaction · 照会中のDraft変更は古い照会結果を無効化",
  tags: ["interaction"],
  render: (args) => <PendingInspectionFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "最初のDraft")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await userEvent.type(input, "と追加入力")
    await userEvent.click(canvas.getByRole("button", { name: "遅延照会を返す" }))
    await expect(input).toHaveValue("最初のDraftと追加入力")
    await expect(canvas.queryByRole("button", { name: "確認完了" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "もう一度保存" })).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "現在の状態を確認" })).toBeVisible()
  },
}


function ProfileNotificationFixture(args: ComponentProps<typeof SettingsProfile>) {
  return (
    <>
      <Notifications position="top-right" />
      <SettingsProfile {...args} />
    </>
  )
}

export const ProfileSuccessNotification: Story = {
  name: "Interaction · 明示保存の成功通知は確定後に一度だけ",
  tags: ["interaction"],
  args: { onSave: fn(async () => undefined) },
  render: (args) => <ProfileNotificationFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    notifications.clean()
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "通知で確定する名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(args.onSave).toHaveBeenCalledTimes(1)
    await expect(await page.findByText("プロフィールを更新しました。")).toBeVisible()
    await expect(page.getAllByText("プロフィールを更新しました。")).toHaveLength(1)
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    notifications.clean()
  },
}

export const ProfileUnknownInspectionInvalidation: Story = {
  name: "Interaction · 現在値確認のあと再編集したら確認を無効化",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => { throw new Error("result missing") }),
    onInspect: fn(async () => "保存されたか不明"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "保存されたか不明")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "確認完了" })).toBeVisible()
    await userEvent.type(input, "を再編集")
    await expect(canvas.queryByRole("button", { name: "確認完了" })).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "現在の状態を確認" })).toBeVisible()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const ProfileSaveStaleQuery: Story = {
  name: "Interaction · 確定後の古い再取得で保存値を巻き戻さない",
  tags: ["interaction"],
  render: (args) => <ProfileRefreshFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "確定した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(args.onSave).toHaveBeenCalled()
    await expect(input).toHaveValue("確定した名前")
    await userEvent.click(canvas.getByRole("button", { name: "プロフィール再取得を再現" }))
    await expect(input).toHaveValue("確定した名前")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
  },
}


export const ProfileFormErrorVisual: Story = {
  name: "Visual · Profile Form-level Validation",
  tags: ["visual"],
  args: {
    onSave: fn(async () => {
      throw new SettingsInputValidationError([
        { scope: "FORM", code: "INVALID_COMBINATION", inputPaths: [] },
      ])
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "修正した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("入力内容を確認してください")
  },
}

export const ProfileRetryableVisual: Story = {
  name: "Visual · Profile Retryable Error",
  tags: ["visual"],
  args: { onSave: fn(async () => { throw { kind: "retryable" } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "修正した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("プロフィールを保存できませんでした")
    await expect(canvas.getByRole("button", { name: "再試行" })).toBeEnabled()
  },
}

export const ProfileUnknownDiffersVisual: Story = {
  name: "Visual · Profile Unknown Current vs Draft",
  tags: ["visual"],
  args: {
    onSave: fn(async () => { throw new Error("unknown") }),
    onInspect: fn(async () => "確認した現在値"),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "もう一度保存" })).toBeEnabled()
    await expect(canvas.getByRole("alert")).toHaveTextContent("確認した現在値")
  },
}

export const ProfileUnknownMatchesVisual: Story = {
  name: "Visual · Profile Unknown Current Matches Draft",
  tags: ["visual"],
  args: {
    onSave: fn(async () => { throw new Error("unknown") }),
    onInspect: fn(async () => "入力した名前"),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "入力した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "確認完了" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("成功した証明ではありません")
  },
}

export const ProfileBlockedVisual: Story = {
  name: "Visual · Profile Blocked",
  tags: ["visual"],
  args: {
    onSave: fn(async () => {
      throw { graphQLErrors: [{ extensions: { code: "UNAUTHENTICATED" } }] }
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更する名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("ログインが必要です")
    await expect(input).toBeDisabled()
  },
}
