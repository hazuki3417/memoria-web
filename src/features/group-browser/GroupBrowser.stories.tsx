import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { GroupBrowser, type GroupBrowserGroup } from "./GroupBrowser"

const fixtures: GroupBrowserGroup[] = [
  { id: "a", name: "アルバムA", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
  { id: "b", name: "アルバムB", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
]

const meta = {
  title: "Features/Group Browser/Screen Interaction",
  component: GroupBrowser,
  parameters: { layout: "fullscreen" },
  args: {
    groupsData: fixtures,
    mediaItemsData: [],
    relationCandidates: fixtures.map((group) => group.name),
    onCreateGroup: fn(async () => undefined),
    onUpdateGroup: fn(async () => undefined),
    onDeleteGroup: fn(async () => undefined),
    onSelectGroup: fn(),
  },
} satisfies Meta<typeof GroupBrowser>
export default meta
type Story = StoryObj<typeof meta>

/** GB-005: 入力途中では一覧を切り替えず、検索確定後に結果を更新する。 */
export const SearchOnlyAfterSubmit: Story = {
  name: "Interaction · Search Only After Submit",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.type(search, "アルバムA")
    await expect(canvas.getByText("アルバムB")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "検索" }))
    await expect(canvas.getByText("アルバムA")).toBeVisible()
    await expect(canvas.queryByText("アルバムB")).not.toBeInTheDocument()
  },
}

/** 作成操作の検証: 名前を入力するまで確定できず、CancelではMutationを通知しない。 */
export const CreateDialogCancel: Story = {
  name: "Interaction · Create Dialog Cancel",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    const create = dialog.getByRole("button", { name: "作成" })
    await expect(create).toBeDisabled()
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "新しいアルバム")
    await expect(create).toBeEnabled()
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await waitFor(() => {
      expect(within(document.body).queryByRole("dialog", { name: "Groupを作成" })).not.toBeInTheDocument()
    })
    await expect(args.onCreateGroup).not.toHaveBeenCalled()
  },
}

/** 作成操作の検証: 確定時にUIの入力値をComponent境界へ通知する。 */
export const CreateGroupSubmitsName: Story = {
  name: "Interaction · Create Group Submits Name",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "新しいアルバム")
    await userEvent.click(dialog.getByRole("button", { name: "作成" }))
    await expect(args.onCreateGroup).toHaveBeenCalledWith("新しいアルバム", [], [])
  },
}


/** GB-003: root以外のGroupも通常の一覧から発見できる。 */
export const FlatDiscovery: Story = {
  name: "Interaction · Flat Discovery",
  tags: ["interaction"],
  args: {
    groupsData: [
      { id: "root", name: "ルート", mediaCount: 0, previewCount: 0, parentNames: [], childNames: ["子"] },
      { id: "child", name: "子", mediaCount: 0, previewCount: 0, parentNames: ["ルート"], childNames: [] },
      { id: "multi", name: "複数Parent", mediaCount: 0, previewCount: 0, parentNames: ["ルート", "別"], childNames: [] },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("ルート")).toBeVisible()
    await expect(canvas.getByText("子")).toBeVisible()
    await expect(canvas.getByText("複数Parent")).toBeVisible()
  },
}

/** GB-006: Enterでも検索が確定し、一致するGroupだけが表示される。 */
export const SearchSubmitWithEnter: Story = {
  name: "Interaction · Search Submit With Enter",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.type(search, "アルバムB{Enter}")
    await expect(canvas.getByText("アルバムB")).toBeVisible()
    await expect(canvas.queryByText("アルバムA")).not.toBeInTheDocument()
  },
}

/** GB-012: scopeが空ではなく、検索結果のみが空の状態。 */
export const SearchNoMatches: Story = {
  name: "Interaction · Search No Matches",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByPlaceholderText("Groupを検索"), "存在しないGroup{Enter}")
    await expect(canvas.queryByText("アルバムA")).not.toBeInTheDocument()
    await expect(canvas.queryByText("アルバムB")).not.toBeInTheDocument()
  },
}

/** GB-013: 入力と確定済み検索を解除すると通常一覧に戻る。 */
export const ClearSearchRestoresDiscovery: Story = {
  name: "Interaction · Clear Search Restores Discovery",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.type(search, "アルバムA{Enter}")
    await expect(canvas.queryByText("アルバムB")).not.toBeInTheDocument()
    await userEvent.clear(search)
    await userEvent.type(search, "{Enter}")
    await expect(canvas.getByText("アルバムA")).toBeVisible()
    await expect(canvas.getByText("アルバムB")).toBeVisible()
  },
}

/** GB-030: relationなしの作成は名前のみを一度通知する。 */
export const CreateWithoutRelations: Story = {
  name: "Interaction · Create Without Relations",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "新規Group")
    await userEvent.click(dialog.getByRole("button", { name: "作成" }))
    await expect(args.onCreateGroup).toHaveBeenCalledExactlyOnceWith("新規Group", [], [])
  },
}

/** GB-034: 作成に失敗してもDialogと入力Draftは失われない。 */
export const CreateFailurePreservesDraft: Story = {
  name: "Interaction · Create Failure Preserves Draft",
  tags: ["interaction"],
  args: { onCreateGroup: fn(async () => { throw new Error("rejected") }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "再試行するGroup")
    await userEvent.click(dialog.getByRole("button", { name: "作成" }))
    await expect(args.onCreateGroup).toHaveBeenCalledTimes(1)
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue("再試行するGroup")
    await expect(dialog.getByRole("button", { name: "作成" })).toBeEnabled()
  },
}

/** GB-035: 結果不明を成功とせず、Draftを保持する。 */
export const CreateUnknownOutcome: Story = {
  name: "Interaction · Create Unknown Outcome",
  tags: ["interaction"],
  args: { onCreateGroup: fn(async () => "unknown" as const) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "結果不明Group")
    await userEvent.click(dialog.getByRole("button", { name: "作成" }))
    await expect(args.onCreateGroup).toHaveBeenCalledTimes(1)
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue("結果不明Group")
  },
}

/** GB-074: 管理権限がなければ作成アクションは実行不能。 */
export const ManagementActionDisabled: Story = {
  name: "Interaction · Management Action Disabled",
  tags: ["interaction"],
  args: { canManage: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { name: "Groupを作成" })).toBeDisabled()
    await expect(args.onCreateGroup).not.toHaveBeenCalled()
  },
}

/** GB-074: Memberでは管理アクションを非表示にできる。 */
export const MemberManagementActionHidden: Story = {
  name: "Interaction · Member Management Action Hidden",
  tags: ["interaction"],
  args: { canManage: false, hideManagementActions: true, contextKind: "community" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole("button", { name: "Groupを作成" })).not.toBeInTheDocument()
  },
}
