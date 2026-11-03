import { Box, Button } from "@mantine/core"
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
  name: "Interaction · 未確定応答は自動再送しない",
  tags: ["interaction"],
  args: { onSave: fn(async () => { throw new Error("network timeout") }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByText("保存結果を確認できませんでした")).toBeVisible()
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
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeEnabled()
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
      "プロフィールを変更できません",
    )
    await expect(input).toHaveValue("変更した名前")
    await expect(input).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const ProfileGraphqlInternalUnknown: Story = {
  name: "Interaction · GraphQL INTERNALは結果未確定で二重送信しない",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw { graphQLErrors: [{ extensions: { code: "INTERNAL" } }] }
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "保存結果を確認できませんでした",
    )
    await expect(input).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
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
