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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText("Groupを検索")
    await userEvent.click(input)
    await userEvent.type(input, "Child")
    const option = await within(document.body).findByRole("option", { name: /Child/ })
    await expect(option).toHaveAttribute("aria-disabled", "true")
    await expect(canvas.getByText("0 / 10")).toBeVisible()
  },
}
