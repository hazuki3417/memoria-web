import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { SettingsSectionContent } from "./SettingsSectionContent"

const meta = {
  title: "Features/Settings/Profile",
  component: SettingsSectionContent,
  args: {
    section: "profile",
    profileNickname: "テストユーザー",
    saveProfile: fn(async () => undefined),
  },
  decorators: [(Story) => <Box maw={760} p="md"><Story /></Box>],
} satisfies Meta<typeof SettingsSectionContent>
export default meta
type Story = StoryObj<typeof meta>

export const Profile: Story = {
  name: "Visual · プロフィール",
  tags: ["visual"],
}
/** Confirms Profile delegates persistence while keeping the existing form interaction. */
export const ProfileSaveContract: Story = {
  name: "Interaction · プロフィール保存",
  tags: ["interaction"],
  args: { section: "profile", saveProfile: fn(async () => undefined) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(args.saveProfile).toHaveBeenCalledWith("変更後の名前")
  },
}

export const ProfileValidationContract: Story = {
  name: "Interaction · ニックネーム必須",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(canvas.getByRole("textbox", { name: /ニックネーム/ }))
    await expect(canvas.getByRole("button", { name: "更新" })).toBeDisabled()
    await expect(canvas.getByText("ニックネームを入力してください。")).toBeVisible()
  },
}

export const ProfileSaveFailed: Story = {
  name: "Interaction · 保存失敗と再試行",
  tags: ["interaction"],
  args: {
    saveProfile: fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(undefined),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /ニックネーム/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "更新" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(input).toHaveValue("変更後の名前")
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(args.saveProfile).toHaveBeenCalledTimes(2)
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const ProfileSaveBlocked: Story = {
  name: "Interaction · 保存不可の状態",
  tags: ["interaction"],
  args: { saveProfile: fn(async () => { throw { kind: "blocked" } }) },
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
