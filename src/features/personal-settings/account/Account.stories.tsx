import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { Account as AccountComponent } from "./Account"

const meta = {
  // Preserve the existing Storybook IDs during this structural refactor.
  title: "features/settings/account/SettingsAccount",
  component: AccountComponent,
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof AccountComponent>
export default meta
type Story = StoryObj<typeof meta>

export const Account: Story = {
  name: "Visual · アカウント",
  tags: ["visual"],
  
}

export const DeleteAccountEntry: Story = {
  name: "Interaction · アカウント削除導線",
  tags: ["interaction"],
  
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(
        "アカウントと関連データを削除します。削除前に、対象データとCommunityへの影響を確認できます。",
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole("link", { name: "アカウントを削除する" }),
    ).toHaveAttribute("href", "/settings/account/delete")
  },
}
