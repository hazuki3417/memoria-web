import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityAliasControl } from "./CommunityAliasControl"

const meta = {
  title: "Features/Community Settings/Community Alias",
  component: CommunityAliasControl,
  args: {
    savedAlias: "元の別名",
    onSave: fn(async () => undefined),
  },
  decorators: [
    (Story) => (
      <Box maw={560} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunityAliasControl>
export default meta
type Story = StoryObj<typeof meta>

export const ClearAlias: Story = {
  name: "Interaction · 空欄によるAlias解除",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(canvas.getByRole("textbox", { name: "Community別名" }))
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSave).toHaveBeenCalledWith(null)
  },
}

export const AliasTooLong: Story = {
  name: "Interaction · Unicode100文字上限",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "あ".repeat(101))
    await expect(canvas.getByText("100文字以内で入力してください。")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const AliasRetry: Story = {
  name: "Interaction · 保存失敗後にDraftを保持",
  tags: ["interaction"],
  args: { onSave: fn(async () => { throw new Error("network") }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "未保存の別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("入力内容を保持しています。再度保存してください。")).toBeVisible()
    await expect(input).toHaveValue("未保存の別名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()
  },
}
