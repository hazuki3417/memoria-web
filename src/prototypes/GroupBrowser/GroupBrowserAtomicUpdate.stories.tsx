import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { GroupBrowser } from "@/features/group-browser/GroupBrowser"

const meta = {
  title: "Features/Group Browser/Atomic Update",
  component: GroupBrowser,
  parameters: { layout: "fullscreen", applicationShell: true },
} satisfies Meta<typeof GroupBrowser>

export default meta
type Story = StoryObj<typeof meta>

export const ConflictRequiresReview: Story = {
  args: {
    groupsData: [
      { id: "g1", name: "旅行", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
    ],
    relationCandidates: [],
    detailsReady: true,
    onUpdateGroup: async () => "conflict",
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement)
    await userEvent.click(await page.findByText("旅行"))
    await userEvent.click(await page.findByRole("button", { name: "編集" }))
    const modal = within(document.body)
    await userEvent.click(await modal.findByRole("button", { name: "保存" }))
    await waitFor(async () => {
      await expect(modal.getByText("Groupの最新状態を確認してください")).toBeVisible()
      await expect(modal.getByRole("button", { name: "保存" })).toBeDisabled()
    })
    // A conflicted draft is kept open; only an explicit review allows another save.
    await userEvent.click(modal.getByRole("button", { name: "確認して再保存" }))
    await expect(modal.getByRole("button", { name: "保存" })).toBeEnabled()
  },
}
