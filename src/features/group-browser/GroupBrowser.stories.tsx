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


/** GB-009/015: Groupを選ぶと同一画面で選択が切り替わる。 */
export const SelectAnotherGroup: Story = {
  name: "Interaction · Select Another Group",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await expect(args.onSelectGroup).toHaveBeenLastCalledWith("a")
    await userEvent.click(canvas.getByRole("button", { name: /アルバムB/ }))
    await expect(args.onSelectGroup).toHaveBeenLastCalledWith("b")
  },
}

/** GB-008: 選択対象が検索結果から外れても、Groupの選択は維持する。 */
export const SearchKeepsSelectedGroup: Story = {
  name: "Interaction · Search Keeps Selected Group",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    const search = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.type(search, "アルバムB{Enter}")
    await expect(args.onSelectGroup).toHaveBeenCalledExactlyOnceWith("a")
    await expect(canvas.getByRole("button", { name: /アルバムB/ })).toBeVisible()
  },
}

/** GB-027/088: 関係Disclosureを開閉するとARIA状態も連動する。 */
export const RelationDisclosureToggle: Story = {
  name: "Interaction · Relation Disclosure Toggle",
  tags: ["interaction"],
  args: {
    groupsData: [
      { id: "a", name: "アルバムA", mediaCount: 0, previewCount: 0, parentNames: ["親"], childNames: ["子"] },
      { id: "b", name: "アルバムB", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    const disclosure = canvas.getByRole("button", { name: "このGroupとの関係を開閉" })
    await expect(disclosure).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(disclosure)
    await expect(disclosure).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(disclosure)
    await expect(disclosure).toHaveAttribute("aria-expanded", "false")
  },
}

/** GB-041/046: 編集CancelではDraftを破棄し、保存を通知しない。 */
export const EditCancelDiscardsDraft: Story = {
  name: "Interaction · Edit Cancel Discards Draft",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    const name = dialog.getByPlaceholderText("Group名")
    await userEvent.clear(name)
    await userEvent.type(name, "保存しない名前")
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await waitFor(() => expect(within(document.body).queryByRole("dialog", { name: "Groupを編集" })).not.toBeInTheDocument())
    await expect(args.onUpdateGroup).not.toHaveBeenCalled()
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const reopened = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await expect(reopened.getByPlaceholderText("Group名")).toHaveValue("アルバムA")
  },
}

/** GB-051/057: renameはGroup IDと最終的なrelation集合を一要求で通知する。 */
export const RenamePreservesRelations: Story = {
  name: "Interaction · Rename Preserves Relations",
  tags: ["interaction"],
  args: {
    groupsData: [
      { id: "a", name: "アルバムA", mediaCount: 0, previewCount: 0, parentNames: ["親"], childNames: ["子"] },
    ],
    relationCandidates: ["親", "子"],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.clear(dialog.getByPlaceholderText("Group名"))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "改名したアルバム")
    await expect(args.onUpdateGroup).not.toHaveBeenCalled()
    await userEvent.click(dialog.getByRole("button", { name: "保存" }))
    await expect(args.onUpdateGroup).toHaveBeenCalledExactlyOnceWith("a", "改名したアルバム", ["親"], ["子"])
  },
}

/** GB-053: 保存失敗でも編集Draftを失わず、Dialogを閉じない。 */
export const EditFailurePreservesDraft: Story = {
  name: "Interaction · Edit Failure Preserves Draft",
  tags: ["interaction"],
  args: { onUpdateGroup: fn(async () => { throw new Error("rejected") }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.clear(dialog.getByPlaceholderText("Group名"))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "再試行する名前")
    await userEvent.click(dialog.getByRole("button", { name: "保存" }))
    await expect(args.onUpdateGroup).toHaveBeenCalledTimes(1)
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue("再試行する名前")
  },
}

/** GB-054: Conflictを返した場合はDialogを維持して無条件再送しない。 */
export const EditConflictBlocksResubmit: Story = {
  name: "Interaction · Edit Conflict Blocks Resubmit",
  tags: ["interaction"],
  args: { onUpdateGroup: fn(async () => "conflict" as const) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.click(dialog.getByRole("button", { name: "保存" }))
    await expect(args.onUpdateGroup).toHaveBeenCalledTimes(1)
    await expect(dialog.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

/** GB-060: 削除のCancelではMutationせず、現在の選択を保持する。 */
export const DeleteCancelKeepsSelection: Story = {
  name: "Interaction · Delete Cancel Keeps Selection",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const editor = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.click(editor.getByRole("button", { name: "削除" }))
    const confirmation = within(await within(document.body).findByRole("dialog", { name: "Groupを削除" }))
    await userEvent.click(confirmation.getByRole("button", { name: "キャンセル" }))
    await expect(args.onDeleteGroup).not.toHaveBeenCalled()
    await expect(args.onSelectGroup).toHaveBeenCalledExactlyOnceWith("a")
  },
}

/** GB-061: 削除の確定成功では対象IDを一度だけ通知し、選択を解除する。 */
export const DeleteSuccessClearsSelection: Story = {
  name: "Interaction · Delete Success Clears Selection",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const editor = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.click(editor.getByRole("button", { name: "削除" }))
    const confirmation = within(await within(document.body).findByRole("dialog", { name: "Groupを削除" }))
    await userEvent.click(confirmation.getByRole("button", { name: "削除" }))
    await expect(args.onDeleteGroup).toHaveBeenCalledExactlyOnceWith("a")
    await expect(args.onSelectGroup).toHaveBeenLastCalledWith(null)
  },
}

/** GB-064: 削除失敗を成功にせず、Dialogと選択を保持する。 */
export const DeleteFailureKeepsSelection: Story = {
  name: "Interaction · Delete Failure Keeps Selection",
  tags: ["interaction"],
  args: { onDeleteGroup: fn(async () => { throw new Error("delete rejected") }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const editor = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.click(editor.getByRole("button", { name: "削除" }))
    const confirmation = within(await within(document.body).findByRole("dialog", { name: "Groupを削除" }))
    await userEvent.click(confirmation.getByRole("button", { name: "削除" }))
    await expect(args.onDeleteGroup).toHaveBeenCalledTimes(1)
    await expect(args.onSelectGroup).toHaveBeenCalledExactlyOnceWith("a")
    await expect(confirmation.getByRole("button", { name: "削除" })).toBeEnabled()
  },
}


/** GB-043: 関係候補の取得失敗では編集を開始せず、閲覧と再試行を維持。 */
export const RelationCandidateErrorRetry: Story = {
  name: "Interaction · Relation Candidate Error Retry",
  tags: ["interaction"],
  args: {
    relationCandidateState: "error",
    onRetryRelationCandidates: fn(async () => undefined),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await expect(canvas.getByText("関係の編集に必要な候補を取得できませんでした。GroupとMediaの閲覧は継続できます。")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(args.onRetryRelationCandidates).toHaveBeenCalledTimes(1)
  },
}

/** GB-070/071: Media詳細取得失敗でも選択Groupを失わず再試行できる。 */
export const DetailLoadErrorRetry: Story = {
  name: "Interaction · Detail Load Error Retry",
  tags: ["interaction"],
  args: {
    mediaDetailState: "error",
    onRetryGroupMedia: fn(async () => undefined),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await expect(canvas.getByText("最新のGroup情報を確認するため、再取得してください。")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(args.onRetryGroupMedia).toHaveBeenCalledTimes(1)
    await expect(args.onSelectGroup).toHaveBeenCalledExactlyOnceWith("a")
  },
}

/** GB-069: 追加Media取得失敗の再試行は選択を解除しない。 */
export const MediaPageErrorRetry: Story = {
  name: "Interaction · Media Page Error Retry",
  tags: ["interaction"],
  args: {
    mediaPageState: "error",
    onRetryMediaPage: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await expect(canvas.getByText("取得済みのMediaは引き続き閲覧できます。")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(args.onRetryMediaPage).toHaveBeenCalledTimes(1)
    await expect(args.onSelectGroup).toHaveBeenCalledExactlyOnceWith("a")
  },
}


/** GB-031: 作成時に選んだParentとChildを1回の確定要求として通知する。 */
export const CreateWithRelations: Story = {
  name: "Interaction · Create With Relations",
  tags: ["interaction"],
  args: { relationCandidates: ["親Group", "子Group"] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "新しいGroup")
    const inputs = dialog.getAllByPlaceholderText("Groupを検索")
    await userEvent.click(inputs[0])
    await userEvent.type(inputs[0], "親Group")
    await userEvent.click(await within(document.body).findByRole("option", { name: /親Group/ }))
    await userEvent.click(inputs[1])
    await userEvent.type(inputs[1], "子Group")
    await userEvent.click(await within(document.body).findByRole("option", { name: /子Group/ }))
    await expect(args.onCreateGroup).not.toHaveBeenCalled()
    await userEvent.click(dialog.getByRole("button", { name: "作成" }))
    await expect(args.onCreateGroup).toHaveBeenCalledExactlyOnceWith("新しいGroup", ["親Group"], ["子Group"])
  },
}

/** GB-056: 保存中の再送を防ぎ、完了後に1回のみ更新通知する。 */
export const EditPendingPreventsDoubleSubmit: Story = {
  name: "Interaction · Edit Pending Prevents Double Submit",
  tags: ["interaction"],
  args: {
    onUpdateGroup: fn(() => new Promise<void>(() => undefined)),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    const save = dialog.getByRole("button", { name: "保存" })
    await userEvent.click(save)
    await expect(save).toBeDisabled()
    await expect(dialog.getByPlaceholderText("Group名")).toHaveValue("アルバムA")
    await waitFor(() => expect(args.onUpdateGroup).toHaveBeenCalledTimes(1))
  },
}

/** GB-055: 更新結果が不明の場合はDialogを保持し、無条件に再保存しない。 */
export const EditUnknownOutcome: Story = {
  name: "Interaction · Edit Unknown Outcome",
  tags: ["interaction"],
  args: { onUpdateGroup: fn(async () => "unknown" as const) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.click(dialog.getByRole("button", { name: "保存" }))
    await expect(args.onUpdateGroup).toHaveBeenCalledTimes(1)
    await expect(dialog.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

/** GB-066: 削除処理中はConfirmの二重送信とCancelを禁止する。 */
export const DeletePendingPreventsDoubleSubmit: Story = {
  name: "Interaction · Delete Pending Prevents Double Submit",
  tags: ["interaction"],
  args: {
    onDeleteGroup: fn(() => new Promise<void>(() => undefined)),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const editor = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.click(editor.getByRole("button", { name: "削除" }))
    const confirm = within(await within(document.body).findByRole("dialog", { name: "Groupを削除" }))
    await userEvent.click(confirm.getByRole("button", { name: "削除" }))
    await expect(confirm.getByRole("button", { name: "削除" })).toBeDisabled()
    await expect(confirm.getByRole("button", { name: "キャンセル" })).toBeDisabled()
    await waitFor(() => expect(args.onDeleteGroup).toHaveBeenCalledTimes(1))
  },
}

/** GB-065: 削除の応答が失われたときに成功と誤認せず、選択を保持する。 */
export const DeleteUnknownOutcome: Story = {
  name: "Interaction · Delete Unknown Outcome",
  tags: ["interaction"],
  args: { onDeleteGroup: fn(async () => { throw new Error("network timeout") }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "編集" }))
    const editor = within(await within(document.body).findByRole("dialog", { name: "Groupを編集" }))
    await userEvent.click(editor.getByRole("button", { name: "削除" }))
    const confirm = within(await within(document.body).findByRole("dialog", { name: "Groupを削除" }))
    await userEvent.click(confirm.getByRole("button", { name: "削除" }))
    await expect(args.onDeleteGroup).toHaveBeenCalledTimes(1)
    await expect(args.onSelectGroup).toHaveBeenCalledExactlyOnceWith("a")
  },
}

/** GB-075: Roleが確定しない状態では、管理ActionからMutationを起動しない。 */
export const PendingPermissionBlocksManagement: Story = {
  name: "Interaction · Pending Permission Blocks Management",
  tags: ["interaction"],
  args: { canManage: false, contextKind: "community" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { name: "Groupを作成" })).toBeDisabled()
    await expect(args.onCreateGroup).not.toHaveBeenCalled()
  },
}

/** GB-078: 保存処理中の管理ActionはCapability喪失と区別してDisabledにする。 */
export const CreatePendingDisablesSubmission: Story = {
  name: "Interaction · Create Pending Disables Submission",
  tags: ["interaction"],
  args: {
    onCreateGroup: fn(() => new Promise<void>(() => undefined)),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "新規Group")
    const create = dialog.getByRole("button", { name: "作成" })
    await userEvent.click(create)
    await expect(create).toBeDisabled()
    await waitFor(() => expect(args.onCreateGroup).toHaveBeenCalledTimes(1))
  },
}

/** GB-028: Relation metadataに別Groupの選択Navigationを混入させない。 */
export const RelationsAreMetadata: Story = {
  name: "Interaction · Relations Are Metadata",
  tags: ["interaction"],
  args: {
    groupsData: [
      { id: "a", name: "アルバムA", mediaCount: 0, previewCount: 0, parentNames: ["親Group"], childNames: ["子Group"] },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /アルバムA/ }))
    await userEvent.click(canvas.getByRole("button", { name: "このGroupとの関係を開閉" }))
    await expect(canvas.getByText("親Group")).toBeVisible()
    await expect(canvas.getByText("子Group")).toBeVisible()
    await expect(args.onSelectGroup).toHaveBeenCalledExactlyOnceWith("a")
  },
}
