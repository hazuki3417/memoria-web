import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { GroupBrowser, type GroupBrowserGroup } from "./GroupBrowser"

const fixtures: GroupBrowserGroup[] = [
  { id: "a", name: "アルバムA", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
  { id: "b", name: "アルバムB", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
]

const meta = {
  title: "Group Browser/Screen Interaction",
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    const create = dialog.getByRole("button", { name: "作成" })
    await expect(create).toBeDisabled()
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "新しいアルバム")
    await expect(create).toBeEnabled()
    await userEvent.click(dialog.getByRole("button", { name: "キャンセル" }))
    await expect(within(document.body).queryByRole("dialog", { name: "Groupを作成" })).not.toBeInTheDocument()
    await expect(args.onCreateGroup).not.toHaveBeenCalled()
  },
}

/** 作成操作の検証: 確定時にUIの入力値をComponent境界へ通知する。 */
export const CreateGroupSubmitsName: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Groupを作成" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "Groupを作成" }))
    await userEvent.type(dialog.getByPlaceholderText("Group名"), "新しいアルバム")
    await userEvent.click(dialog.getByRole("button", { name: "作成" }))
    await expect(args.onCreateGroup).toHaveBeenCalledWith("新しいアルバム", [], [])
  },
}
