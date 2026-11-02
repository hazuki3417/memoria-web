import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, within } from "storybook/test"
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
