import { Box, Button } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunitySettingsStoryNavigation } from "../storybook/CommunitySettingsStoryNavigation"
import type { SaveCommunityName } from "./CommunityNameSection/communityNameSaveOutcome"

type CommunityNameOutcome = Awaited<ReturnType<SaveCommunityName>>
const saveUnknown = (): CommunityNameOutcome => ({ kind: "unknown" })

const meta = {
  title: "Features/Community Settings/Settings",
  component: CommunitySettingsStoryNavigation,
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
} satisfies Meta<typeof CommunitySettingsStoryNavigation>
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

/** URL-controlled consumers do not opt into the Preview-only Invitation simulation by default. */
export const InvitationUrlControlledUnavailable: Story = {
  name: "Interaction · URL制御ではInvitationデモが既定で無効",
  tags: ["interaction"],
  args: { invitationMode: "unavailable" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("招待URLの管理機能は現在利用できません。")).toBeVisible()
    await expect(canvas.queryByRole("textbox", { name: "招待URL" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLを発行" })).not.toBeInTheDocument()
  },
}

/** Story IDは維持し、Generalを離れるとDraftが破棄される契約を検証する。 */
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
