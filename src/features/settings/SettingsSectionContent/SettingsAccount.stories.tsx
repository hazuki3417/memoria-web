import { Box, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, within } from "storybook/test"
import { SettingsSectionContent } from "./SettingsSectionContent"

const meta = {
  title: "Features/Settings/Account",
  component: SettingsSectionContent,
  args: {
    section: "profile",
    profileNickname: "テストユーザー",
    saveProfile: fn(async () => undefined),
    usageContent: <Text>利用状況の表示領域</Text>,
  },
  decorators: [(Story) => <Box maw={760} p="md"><Story /></Box>],
} satisfies Meta<typeof SettingsSectionContent>
export default meta
type Story = StoryObj<typeof meta>

export const Account: Story = {
  name: "Visual · アカウント",
  tags: ["visual"],
  args: { section: "account" },
}

export const DeleteAccountEntry: Story = {
  name: "Interaction · アカウント削除導線",
  tags: ["interaction"],
  args: { section: "account" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("アカウントと関連データを削除します。削除前に、対象データとCommunityへの影響を確認できます。")).toBeVisible()
    await expect(canvas.getByRole("link", { name: "アカウントを削除する" })).toHaveAttribute(
      "href",
      "/settings/account/delete",
    )
  },
}
