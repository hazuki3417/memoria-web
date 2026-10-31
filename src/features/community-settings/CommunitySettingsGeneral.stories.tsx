import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunitySettings } from "./CommunitySettings"

const meta = {
  title: "Features/Community Settings/Settings",
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

/** CommunityNameSection states are verified through the actual General page. */
export const NameEdited: Story = {
  name: "Interaction · Community名編集中",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(canvas.getByRole("textbox", { name: /Community名/ }))
    await userEvent.type(canvas.getByRole("textbox", { name: /Community名/ }), "新しいCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()
  },
}

export const NameInvalid: Story = {
  name: "Interaction · Community名未入力",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(canvas.getByRole("textbox", { name: /Community名/ }))
    await expect(canvas.getByText("Community名を入力してください")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameSaving: Story = {
  name: "Interaction · Community名保存中",
  tags: ["interaction"],
  args: { onSaveName: fn(() => new Promise<boolean>(() => undefined)) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "新しいCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSaveName).toHaveBeenCalledWith("新しいCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameReadOnly: Story = {
  name: "Visual · Community名閲覧のみ",
  tags: ["visual"],
  args: { role: "member" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toBeDisabled()
    await expect(canvas.queryByRole("button", { name: "保存" })).not.toBeInTheDocument()
  },
}
