import { Box, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunitySettings } from "./CommunitySettings"

const meta = {
  title: "Features/Settings/Community/Sections",
  component: CommunitySettings,
  args: {
    communityId: "photo-club",
    communityName: "家族のアルバム",
    role: "admin",
    section: "general",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "member" },
    ],
  },
  decorators: [(Story) => <Box h={600}><Story /></Box>],
} satisfies Meta<typeof CommunitySettings>
export default meta
type Story = StoryObj<typeof meta>

export const General: Story = {
  name: "Visual · 一般",
  tags: ["visual"],
}
export const Members: Story = {
  name: "Visual · メンバー",
  tags: ["visual"],
  args: { section: "members" },
}
export const Preferences: Story = {
  name: "Visual · 環境設定",
  tags: ["visual"],
  args: { section: "preferences" },
}
export const Usage: Story = {
  name: "Visual · 利用状況",
  tags: ["visual"],
  args: {
    section: "usage",
    usageContent: <Text>利用状況の表示領域</Text>,
  },
}

/** Member search must filter the real member table without changing navigation. */
export const MemberSearchContract: Story = {
  name: "Interaction · メンバー検索",
  tags: ["interaction"],
  args: { section: "members" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByRole("textbox", { name: "参加者を名前で検索" }),
      "家族メンバー",
    )
    await expect(canvas.getByText("家族メンバー")).toBeVisible()
    await expect(canvas.queryByText("テストユーザー")).not.toBeInTheDocument()
  },
}

/** The modal is rendered in a portal; test the actual confirmation flow. */
export const RemoveMemberSuccessContract: Story = {
  name: "Interaction · メンバー除外成功",
  tags: ["interaction"],
  args: { section: "members", onRemoveMember: fn(async () => true) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "家族メンバーの管理操作" }))
    await userEvent.click(await page.findByText("除外", { exact: true }))
    await userEvent.click(await page.findByRole("button", { name: "除外する" }))
    await expect(args.onRemoveMember).toHaveBeenCalledWith("user-2")
    await expect(page.queryByRole("dialog", { name: "メンバーを除外" })).not.toBeInTheDocument()
  },
}

export const RemoveMemberFailureContract: Story = {
  name: "Interaction · メンバー除外失敗",
  tags: ["interaction"],
  args: { section: "members", onRemoveMember: fn(async () => false) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "家族メンバーの管理操作" }))
    await userEvent.click(await page.findByText("除外", { exact: true }))
    await userEvent.click(await page.findByRole("button", { name: "除外する" }))
    await expect(args.onRemoveMember).toHaveBeenCalledWith("user-2")
    await expect(page.getByRole("dialog", { name: "メンバーを除外" })).toBeVisible()
  },
}

export const MemberRoleChangeContract: Story = {
  name: "Interaction · メンバー権限変更",
  tags: ["interaction"],
  args: { section: "members", onChangeMemberRole: fn(async () => true) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "家族メンバーの管理操作" }))
    await userEvent.click(await page.findByText("役割を変更", { exact: true }))
    const dialog = await page.findByRole("dialog", { name: "役割を変更" })
    await userEvent.click(within(dialog).getByRole("radio", { name: /Administrator/ }))
    await userEvent.click(within(dialog).getByRole("button", { name: "変更する" }))
    await expect(args.onChangeMemberRole).toHaveBeenCalledWith("user-2", "admin")
  },
}

export const LeaveFailureContract: Story = {
  name: "Interaction · Community退会失敗",
  tags: ["interaction"],
  args: {
    section: "members",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "admin" },
    ],
    onLeaveCommunity: fn(async () => { throw new Error("network") }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "Communityから退会する" }))
    const dialog = await page.findByRole("dialog", { name: "Communityから退会" })
    await userEvent.click(within(dialog).getByRole("button", { name: "退会する" }))
    await expect(await within(dialog).findByRole("alert")).toBeVisible()
  },
}
