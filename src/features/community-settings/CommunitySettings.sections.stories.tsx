import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { CommunitySettings } from "./CommunitySettings"
import { CommunitySettingsStoryNavigation } from "./CommunitySettingsStoryNavigation"

const meta = {
  title: "Features/Community Settings/Members",
  component: CommunitySettings,
  render: (args) => <CommunitySettingsStoryNavigation {...args} />,
  args: {
    onSectionChange: () => undefined,
    invitationMode: "preview",
    communityId: "photo-club",
    communityName: "家族のアルバム",
    role: "admin",
    section: "general",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "member" },
    ],
  },
  decorators: [
    (Story) => (
      <Box h={600}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunitySettings>
export default meta
type Story = StoryObj<typeof meta>

export const Members: Story = {
  name: "Visual · メンバー",
  tags: ["visual"],
  args: { section: "members" },
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
    await userEvent.click(
      canvas.getByRole("button", { name: "家族メンバーの管理操作" }),
    )
    await userEvent.click(await page.findByText("除外", { exact: true }))
    await userEvent.click(await page.findByRole("button", { name: "除外する" }))
    await expect(args.onRemoveMember).toHaveBeenCalledWith("user-2")
    await waitFor(() => {
      expect(
        page.queryByRole("dialog", { name: "メンバーを除外" }),
      ).not.toBeInTheDocument()
    })
  },
}

export const RemoveMemberFailureContract: Story = {
  name: "Interaction · メンバー除外失敗",
  tags: ["interaction"],
  args: { section: "members", onRemoveMember: fn(async () => false) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      canvas.getByRole("button", { name: "家族メンバーの管理操作" }),
    )
    await userEvent.click(await page.findByText("除外", { exact: true }))
    await userEvent.click(await page.findByRole("button", { name: "除外する" }))
    await expect(args.onRemoveMember).toHaveBeenCalledWith("user-2")
    // Mantine Modal uses a transition; wait for visibility after the failed save.
    await waitFor(async () => {
      const dialog = page.getByRole("dialog", { name: "メンバーを除外" })
      await expect(dialog).toBeVisible()
      await expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "除外の結果を確認できませんでした",
      )
      await expect(within(dialog).getByRole("button", { name: "除外する" })).toBeDisabled()
    })
  },
}

export const MemberRoleChangeContract: Story = {
  name: "Interaction · メンバー権限変更",
  tags: ["interaction"],
  args: { section: "members", onChangeMemberRole: fn(async () => true) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      canvas.getByRole("button", { name: "家族メンバーの管理操作" }),
    )
    await userEvent.click(await page.findByText("役割を変更", { exact: true }))
    const dialog = await page.findByRole("dialog", { name: "役割を変更" })
    await userEvent.click(
      within(dialog).getByRole("radio", { name: /Administrator/ }),
    )
    await userEvent.click(
      within(dialog).getByRole("button", { name: "変更する" }),
    )
    await expect(args.onChangeMemberRole).toHaveBeenCalledWith(
      "user-2",
      "admin",
    )
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
    onLeaveCommunity: fn(async () => {
      throw new Error("network")
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      canvas.getByRole("button", { name: "Communityから退会する" }),
    )
    const dialog = await page.findByRole("dialog", {
      name: "Communityから退会",
    })
    await userEvent.click(
      within(dialog).getByRole("button", { name: "退会する" }),
    )
    await waitFor(() => {
      expect(within(dialog).getByRole("alert")).toBeVisible()
      expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "退会処理に失敗しました",
      )
    })
  },
}

export const MemberRoleChangeFailureContract: Story = {
  name: "Interaction · メンバー権限変更失敗",
  tags: ["interaction"],
  args: { section: "members", onChangeMemberRole: fn(async () => false) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      canvas.getByRole("button", { name: "家族メンバーの管理操作" }),
    )
    await userEvent.click(await page.findByText("役割を変更", { exact: true }))
    const dialog = await page.findByRole("dialog", { name: "役割を変更" })
    await userEvent.click(
      within(dialog).getByRole("radio", { name: /Administrator/ }),
    )
    await userEvent.click(
      within(dialog).getByRole("button", { name: "変更する" }),
    )
    await expect(args.onChangeMemberRole).toHaveBeenCalledWith(
      "user-2",
      "admin",
    )
    // Mantine Modal's portal exists before its enter transition finishes.
    // Wait for the dialog and persistent recovery feedback together.
    await waitFor(async () => {
      await expect(dialog).toBeVisible()
      await expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "役割変更の結果を確認できませんでした",
      )
      await expect(within(dialog).getByRole("button", { name: "変更する" })).toBeDisabled()
    })
  },
}

export const LeaveSuccessContract: Story = {
  name: "Interaction · Community退会成功",
  tags: ["interaction"],
  args: {
    section: "members",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "admin" },
    ],
    onLeaveCommunity: fn(async () => undefined),
    onLeaveSuccess: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      canvas.getByRole("button", { name: "Communityから退会する" }),
    )
    const dialog = await page.findByRole("dialog", {
      name: "Communityから退会",
    })
    await userEvent.click(
      within(dialog).getByRole("button", { name: "退会する" }),
    )
    await expect(args.onLeaveCommunity).toHaveBeenCalledOnce()
    await expect(args.onLeaveSuccess).toHaveBeenCalledOnce()
  },
}


// Visual review variants hold the actual confirmation Modal open after a
// simulated uncertain outcome; no separate fake Panel is rendered.
export const RemoveMemberFailureVisual: Story = {
  ...RemoveMemberFailureContract,
  name: "Visual · メンバー除外の結果未確定",
  tags: ["visual"],
}

export const RoleChangeFailureVisual: Story = {
  ...MemberRoleChangeFailureContract,
  name: "Visual · 役割変更の結果未確定",
  tags: ["visual"],
}
