import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { RelationEditor } from "./RelationEditor"

const meta = {
  title: "Group Browser/Relation Editor",
  component: RelationEditor,
  args: {
    label: "Parents",
    names: [],
    oppositeNames: ["Child"],
    currentGroupName: "現在",
    candidates: ["現在", "Parent", "Child", "候補"],
  },
  render: (args) => {
    const [names, setNames] = useState(args.names)
    return <RelationEditor {...args} names={names} onChange={setNames} />
  },
} satisfies Meta<typeof RelationEditor>
export default meta
type Story = StoryObj<typeof meta>

export const ParentSelection: Story = {
  name: "Interaction · Parent Selection",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.click(input)
    await userEvent.type(input, "Parent")
    const option = await within(document.body).findByRole("option", { name: /Parent/ })
    await userEvent.click(option)
    await expect(canvas.getByText("1 / 10")).toBeVisible()
    await expect(canvas.getByText("Parent")).toBeVisible()
  },
}

export const OppositeSelectionDisabled: Story = {
  name: "Interaction · Opposite Selection Disabled",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.click(input)
    await userEvent.type(input, "Child")
    await within(document.body).findByRole("option", { name: /Child/ })
    // 利用者の確定操作を試みても、反対方向のGroupは選択されない。
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByText("0 / 10")).toBeVisible()
    await expect(canvas.queryByText("Child")).not.toBeInTheDocument()
  },
}

/**
 * GB-049: 選択済みRelationを個別解除しても、他の選択は保持される。
 * 一括Clearボタンは表示しない。
 */
export const RemoveOneSelectedRelation: Story = {
  name: "Interaction · Remove One Selected Relation",
  tags: ["interaction"],
  args: {
    names: ["Parent", "候補"],
    oppositeNames: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("2 / 10")).toBeVisible()

    const input = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.click(input)
    await userEvent.type(input, "Parent")
    const option = await within(document.body).findByRole("option", { name: /Parent/ })
    await userEvent.click(option)

    await expect(canvas.getByText("1 / 10")).toBeVisible()
    await expect(canvas.getByText("候補")).toBeVisible()
  },
}

/** GB-047: 名前検索に一致する候補がない場合の空状態。 */
export const NoMatchingCandidates: Story = {
  name: "Interaction · No Matching Candidates",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.click(input)
    await userEvent.type(input, "存在しない候補")
    await expect(
      await within(document.body).findByText("候補がありません"),
    ).toBeVisible()
    await expect(canvas.getByText("0 / 10")).toBeVisible()
  },
}

/** GB-047: 現在のGroup自身はParentに選べない。 */
export const CurrentGroupCannotBeParent: Story = {
  name: "Interaction · Current Group Cannot Be Parent",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.click(input)
    await userEvent.type(input, "現在")
    await within(document.body).findByRole("option", { name: /現在/ })
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByText("0 / 10")).toBeVisible()
  },
}

/** GB-049: 10件選択済みでも上限の案内が表示される。 */
export const SelectionLimit: Story = {
  name: "Interaction · Selection Limit",
  tags: ["interaction"],
  args: {
    names: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    candidates: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
    oppositeNames: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("10 / 10")).toBeVisible()
    await expect(canvas.getByText("追加できるGroupは10件までです")).toBeVisible()
    const input = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.click(input)
    await userEvent.type(input, "K")
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByText("10 / 10")).toBeVisible()
  },
}
