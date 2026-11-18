import { Box, Button } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { Usage as UsageComponent } from "@/features/usage"
import { sampleUsage, zeroUsage } from "@/features/usage/usageStoryFixtures"
import { CommunitySettingsView } from "./CommunitySettingsView"
import { CommunitySettingsStoryNavigation } from "./storybook/CommunitySettingsStoryNavigation"
import type { SaveCommunityName } from "./general/CommunityNameSection/communityNameSaveOutcome"

type CommunityNameOutcome = Awaited<ReturnType<SaveCommunityName>>
const saveUnknown = (): CommunityNameOutcome => ({ kind: "unknown" })

type ScreenStoryArgs = ComponentProps<typeof CommunitySettingsView> &
  ComponentProps<typeof CommunitySettingsStoryNavigation>

/** 画面全体を所有するViewのStory。NavigationはStory専用の実行Adapterで接続する。 */
const meta = {
  title: "features/community-settings/CommunitySettingsView",
  component: CommunitySettingsView,
  render: (args: ScreenStoryArgs) => <CommunitySettingsStoryNavigation {...args} />,
  args: {
    content: null,
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
} satisfies Meta<ScreenStoryArgs>
export default meta
type Story = StoryObj<typeof meta>


export const General: Story = {
  name: "Visual · 一般",
  tags: ["visual"],
}

/** Mirrors the production key={communityId} remount boundary without a Router mock. */
function CommunitySwitchFixture(args: ComponentProps<typeof CommunitySettingsStoryNavigation>) {
  const [communityId, setCommunityId] = useState("photo-club")
  const communityName =
    communityId === "photo-club" ? "家族のアルバム" : "旅行の思い出"
  return (
    <>
      <Button
        onClick={() =>
          setCommunityId((id) =>
            id === "photo-club" ? "travel-club" : "photo-club",
          )
        }
      >
        Communityを切り替える
      </Button>
      <CommunitySettingsStoryNavigation
        {...args}
        key={communityId}
        communityId={communityId}
        communityName={communityName}
      />
    </>
  )
}

/** Context changes must not reuse the previous Community's RHF draft. */
export const NameContextChangeReset: Story = {
  name: "Interaction · Community切替で編集Draftを初期化",
  tags: ["interaction"],
  render: (args) => <CommunitySwitchFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のCommunity名")
    await expect(input).toHaveValue("編集中のCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue(
      "旅行の思い出",
    )
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue(
      "家族のアルバム",
    )
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

/** Preview invitation state must not cross the production Community key boundary. */
export const InvitationContextChangeReset: Story = {
  name: "Interaction · Community切替でInvitation状態を初期化",
  tags: ["interaction"],
  render: (args) => <CommunitySwitchFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("未発行")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "招待URLを発行" }))
    await expect(canvas.getByText("有効")).toBeVisible()

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByText("未発行")).toBeVisible()
    await expect(canvas.getByRole("textbox", { name: "招待URL" })).toHaveValue("-")

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByText("未発行")).toBeVisible()
  },
}


/** Switching from Administrator to Member must immediately hide an issued preview secret. */
function InvitationRoleChangeFixture(args: ComponentProps<typeof CommunitySettingsStoryNavigation>) {
  const [role, setRole] = useState<"admin" | "member">("admin")
  return (
    <>
      <Button onClick={() => setRole((current) => current === "admin" ? "member" : "admin")}>
        Roleを切り替える
      </Button>
      <CommunitySettingsStoryNavigation {...args} role={role} />
    </>
  )
}

export const InvitationRoleChangeSecretProtection: Story = {
  name: "Interaction · Memberへの変更でInvitation URLを非表示",
  tags: ["interaction"],
  render: (args) => <InvitationRoleChangeFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "招待URLを発行" }))
    await expect(canvas.getByRole("textbox", { name: "招待URL" })).toHaveValue(
      "https://example.com/invitations/photo-club-demo-1",
    )

    await userEvent.click(canvas.getByRole("button", { name: "Roleを切り替える" }))
    await expect(canvas.getByText("招待URLの発行と管理はAdministratorのみ行えます。")).toBeVisible()
    await expect(canvas.queryByRole("textbox", { name: "招待URL" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLをコピー" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "再発行" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "無効化" })).not.toBeInTheDocument()
  },
}

export const InvitationProductionUnavailable: Story = {
  name: "Interaction · 本番では仮Invitationを発行しない",
  tags: ["interaction"],
  args: { invitationMode: "unavailable" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("招待URLの管理機能は現在利用できません。")).toBeVisible()
    await expect(canvas.queryByRole("textbox", { name: "招待URL" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLを発行" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLをコピー" })).not.toBeInTheDocument()
  },
}

/** Generalを離れるとDraftが破棄される契約を検証する。 */
export const NameDraftSurvivesNavigation: Story = {
  name: "Interaction · Section切替でCommunity名のDraftを破棄",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のCommunity名")
    await expect(input).toHaveValue("編集中のCommunity名")

    const navigation = within(canvas.getByRole("navigation", { name: "Community設定" }))
    await userEvent.click(navigation.getByText("メンバー"))
    await expect(canvas.queryByRole("textbox", { name: /Community名/ })).not.toBeInTheDocument()
    await userEvent.click(navigation.getByText("一般"))
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue("家族のアルバム")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

/** 保存結果不明の表示もGeneral離脱で破棄し、戻った際はサーバー由来の値から開始する。 */
export const NameUnknownSurvivesNavigation: Story = {
  name: "Interaction · Section切替でCommunity名の未確定状態を破棄",
  tags: ["interaction"],
  args: { onSaveName: fn(async () => { return saveUnknown() }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("Community名の保存結果を確認できませんでした")).toBeVisible()

    const navigation = within(canvas.getByRole("navigation", { name: "Community設定" }))
    await userEvent.click(navigation.getByText("メンバー"))
    await userEvent.click(navigation.getByText("一般"))
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue("家族のアルバム")
    await expect(canvas.queryByText("Community名の保存結果を確認できませんでした")).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
  },
}

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

/** A self demotion uses the same row menu and role Modal, not the leave action. */
/** Mirrors a refreshed membership after confirmed self demotion. */
function SelfDemotionUpdatedMembershipFixture(
  args: ComponentProps<typeof CommunitySettingsStoryNavigation>,
) {
  const [members, setMembers] = useState<Array<{
    id: string
    name: string
    role: "admin" | "member"
    isSelf?: boolean
  }>>([
    { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
    { id: "user-2", name: "家族メンバー", role: "admin" },
  ])
  return (
    <CommunitySettingsStoryNavigation
      {...args}
      section="members"
      role={members[0].role}
      members={members}
      onChangeMemberRole={async (userId, role) => {
        setMembers((current) => current.map((member) =>
          member.id === userId ? { ...member, role } : member,
        ))
        return true
      }}
    />
  )
}

export const SelfDemotionPermissionsUpdated: Story = {
  name: "Interaction · 自己降格後は管理操作を失い閲覧・退会を維持",
  tags: ["interaction"],
  render: (args) => <SelfDemotionUpdatedMembershipFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "テストユーザーの管理操作" }))
    await userEvent.click(await page.findByRole("menuitem", { name: "役割を変更" }))
    const dialog = await page.findByRole("dialog", { name: "役割を変更" })
    await userEvent.click(within(dialog).getByRole("radio", { name: /^Member/ }))
    await userEvent.click(within(dialog).getByRole("button", { name: "変更する" }))
    await waitFor(() => {
      expect(canvas.queryByRole("button", { name: "テストユーザーの管理操作" })).not.toBeInTheDocument()
      expect(canvas.queryByRole("button", { name: "家族メンバーの管理操作" })).not.toBeInTheDocument()
    })
    await expect(canvas.getByText("テストユーザー")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "Communityから退会する" })).toBeEnabled()
  },
}

export const SelfAdministratorDemotion: Story = {
  name: "Interaction · 自分のAdministrator降格と管理権限喪失の確認",
  tags: ["interaction"],
  args: {
    section: "members",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "admin" },
    ],
    onChangeMemberRole: fn(async () => true),
    onRemoveMember: fn(async () => true),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "テストユーザーの管理操作" }))
    await expect(page.queryByRole("menuitem", { name: "除外" })).not.toBeInTheDocument()
    await userEvent.click(await page.findByRole("menuitem", { name: "役割を変更" }))
    const dialog = await page.findByRole("dialog", { name: "役割を変更" })
    await expect(within(dialog).getByRole("button", { name: "変更する" })).toBeDisabled()
    await userEvent.click(within(dialog).getByRole("radio", { name: /^Member/ }))
    await expect(within(dialog).getByText(/Community設定や参加者を管理する権限を失います/)).toBeVisible()
    await expect(within(dialog).getByText(/参加者の閲覧と退会は可能/)).toBeVisible()
    await userEvent.click(within(dialog).getByRole("button", { name: "変更する" }))
    await expect(args.onChangeMemberRole).toHaveBeenCalledWith("user-1", "member")
    await expect(args.onRemoveMember).not.toHaveBeenCalled()
  },
}

export const LastAdministratorDemotionBlocked: Story = {
  name: "Interaction · 最後のAdministratorは自分を降格できない",
  tags: ["interaction"],
  args: {
    section: "members",
    onChangeMemberRole: fn(async () => true),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "テストユーザーの管理操作" }))
    await userEvent.click(await page.findByRole("menuitem", { name: "役割を変更" }))
    const dialog = await page.findByRole("dialog", { name: "役割を変更" })
    await expect(within(dialog).getByText("最後のAdministratorはMemberに変更できません。")).toBeVisible()
    await expect(within(dialog).getByRole("radio", { name: /^Member/ })).toBeDisabled()
    await expect(within(dialog).getByRole("button", { name: "変更する" })).toBeDisabled()
    await expect(args.onChangeMemberRole).not.toHaveBeenCalled()
  },
}

export const OtherAdministratorDemotionWarning: Story = {
  name: "Interaction · 他Administrator降格時の管理権限喪失説明",
  tags: ["interaction"],
  args: {
    section: "members",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "admin" },
    ],
    onChangeMemberRole: fn(async () => true),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "家族メンバーの管理操作" }))
    await userEvent.click(await page.findByRole("menuitem", { name: "役割を変更" }))
    const dialog = await page.findByRole("dialog", { name: "役割を変更" })
    await userEvent.click(within(dialog).getByRole("radio", { name: /^Member/ }))
    await expect(within(dialog).getByText(/家族メンバーはAdministrator権限を失い/)).toBeVisible()
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

export const Preferences: Story = {
  name: "Visual · 環境設定",
  tags: ["visual"],
  args: { section: "preferences" },
}

export const Usage: Story = {
  name: "Visual · 利用状況",
  tags: ["visual"],
  args: { section: "usage", usageContent: <UsageComponent scope="community" usage={sampleUsage} /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("table")).toBeVisible()
    await expect(
      canvas.getByText(
        "このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。",
      ),
    ).toBeVisible()
  },
}

export const Empty: Story = {
  name: "Visual · 登録0件",
  tags: ["visual"],
  args: { section: "usage", usageContent: <UsageComponent scope="community" usage={zeroUsage} /> },
}

export const ErrorState: Story = {
  name: "Visual · 取得失敗",
  tags: ["visual"],
  args: {
    section: "usage",
    usageContent: <UsageComponent scope="community" usage={sampleUsage} />,
    usageState: "error",
  },
}

export const LoadingState: Story = {
  name: "Visual · 読み込み中",
  tags: ["visual"],
  args: {
    section: "usage",
    usageContent: <UsageComponent scope="community" usage={sampleUsage} />,
    usageState: "loading",
  },
}
