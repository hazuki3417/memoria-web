import { Box, Button } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { SettingsProfile } from "./SettingsProfile"

const meta = {
  title: "Features/Settings/Profile/Initial Save State",
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
