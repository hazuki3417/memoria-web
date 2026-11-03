import { Box, Button } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
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
