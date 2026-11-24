import { Box, Button } from "@mantine/core"
import { Notifications, notifications } from "@mantine/notifications"
import { useRef, useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { ProfileView } from "./ProfileView"
import type { ActionOutcome } from "@/ui/Action"
import type { ProfileSaveRejection } from "./profileSaveOutcome"

type ProfileOutcome = ActionOutcome<string, ProfileSaveRejection>
const success = (nickname: string): ProfileOutcome => ({ kind: "success", value: nickname })
const unknown = (): ProfileOutcome => ({ kind: "unknown" })
const validation = (
  violations: Extract<ProfileSaveRejection, { kind: "validation" }>["violations"],
): ProfileOutcome => ({
  kind: "rejected",
  reason: { kind: "validation", violations },
})
const blocked = (error: unknown): ProfileOutcome => ({
  kind: "rejected",
  reason: { kind: "blocked", error },
})
const retryable = (): ProfileOutcome => ({
  kind: "rejected",
  reason: { kind: "retryable" },
})

const meta = {
  // 既存Story IDを維持したままFeature分類を揃える。
  id: "features-settings-profile-profileview",
  title: "features/personal-settings/profile/ProfileView",
  component: ProfileView,
  args: {
    initialNickname: "テストユーザー",
    onSave: fn(async (nickname: string) => success(nickname)),
  },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ProfileView>
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

function ProfileRefreshFixture(args: ComponentProps<typeof ProfileView>) {
  const [nickname, setNickname] = useState(args.initialNickname ?? "テストユーザー")
  return (
    <>
      <Button onClick={() => setNickname("テストユーザー")}>
        プロフィール再取得を再現
      </Button>
      <ProfileView {...args} initialNickname={nickname} />
    </>
  )
}

export const RefreshWhileUntouched: Story = {
  name: "Interaction · 未編集でも表示後のQuery値は自動反映しない",
  tags: ["interaction"],
  render: (args) => <ProfileRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "プロフィール再取得を再現" }))
    await expect(canvas.getByRole("textbox", { name: /ニックネーム/ })).toHaveValue(
      "テストユーザー",
    )
  },
}

export const RefreshArrivesWhileEditingThenReverted: Story = {
  name: "Interaction · 編集終了後もQuery値を自動採用しない",
  tags: ["interaction"],
  render: (args) => <ProfileRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    const save = canvas.getByRole("button", { name: "更新" })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のDraft")
    await userEvent.click(canvas.getByRole("button", { name: "プロフィール再取得を再現" }))
    await expect(input).toHaveValue("編集中のDraft")
    await userEvent.clear(input)
    await userEvent.type(input, "テストユーザー")
    await expect(input).toHaveValue("テストユーザー")
    await expect(save).toBeDisabled()
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
  args: { onSave: fn(async (nickname: string) => success(nickname)) },
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
  name: "Interaction · 保存失敗後も通常の更新から再保存",
  tags: ["interaction"],
  args: {
    onSave: fn()
      .mockResolvedValueOnce(retryable())
      .mockImplementation((nickname: string) => Promise.resolve(success(nickname))),
  },
  play: async ({ canvasElement, args }) => {
    args.onSave?.mockReset()
    args.onSave?.mockResolvedValueOnce(retryable())
    args.onSave?.mockImplementation((nickname: string) => Promise.resolve(success(nickname)))
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(input).toHaveValue("変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(args.onSave).toHaveBeenCalledTimes(2)
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const ProfileServerFieldValidation: Story = {
  name: "Interaction · API Field ValidationをRHFに反映",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      return validation([
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
  name: "Interaction · 保存結果不明は再送せず再読み込みを案内",
  tags: ["interaction"],
  args: { onSave: fn(async () => unknown()) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "保存したか不明")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("ページを再読み込みして状態を確認してください")
    await expect(input).toHaveValue("保存したか不明")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(canvas.queryByRole("button", { name: "現在の状態を確認" })).not.toBeInTheDocument()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
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
function ProfileInFlightFixture(args: ComponentProps<typeof ProfileView>) {
  const [nickname, setNickname] = useState(args.initialNickname ?? "テストユーザー")
  const resolveSave = useRef<(() => void) | null>(null)
  return (
    <>
      <Button onClick={() => setNickname("保存中に再取得した名前")}>
        保存中に再取得を再現
      </Button>
      <Button onClick={() => resolveSave.current?.()}>保存応答を返す</Button>
      <ProfileView
        {...args}
        initialNickname={nickname}
        onSave={(nickname) =>
          new Promise<ProfileOutcome>((resolve) => {
            resolveSave.current = () => resolve(success(nickname))
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
  args: { onSave: fn(async (nickname: string) => success(nickname)) },
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
      return validation([
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



export const ProfileRefreshAfterRevert: Story = {
  name: "Interaction · 編集を元に戻してもQuery値は採用しない",
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
    await expect(input).toHaveValue("テストユーザー")
    await expect(save).toBeDisabled()
  },
}


function ProfileNotificationFixture(args: ComponentProps<typeof ProfileView>) {
  return (
    <>
      <Notifications position="top-right" />
      <ProfileView {...args} />
    </>
  )
}

export const ProfileSuccessNotification: Story = {
  name: "Interaction · 明示保存の成功通知は確定後に一度だけ",
  tags: ["interaction"],
  args: { onSave: fn(async (nickname: string) => success(nickname)) },
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
    await waitFor(() => {
      return expect(page.getByText("プロフィールを更新しました。")).toBeVisible()
    })
    await expect(page.getAllByText("プロフィールを更新しました。")).toHaveLength(1)
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    notifications.clean()
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
      return validation([
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
  name: "Visual · Profile Save Error",
  tags: ["visual"],
  args: { onSave: fn(async () => { return retryable() }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "修正した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("プロフィールを保存できませんでした")
    await expect(canvas.getByRole("button", { name: "更新" })).toBeEnabled()
  },
}

export const ProfileBlockedVisual: Story = {
  name: "Visual · Profile Blocked",
  tags: ["visual"],
  args: {
    onSave: fn(async () => {
      return blocked({ graphQLErrors: [{ extensions: { code: "UNAUTHENTICATED" } }] })
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


export const UnexpectedActionError: Story = {
  name: "Interaction · Action例外は未確認扱いで自動再送しない",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw new Error("Unexpected adapter failure")
    }),
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
    await expect(args.onSave).toHaveBeenCalledTimes(1)
    await expect(input).toHaveValue("変更した名前")
  },
}
