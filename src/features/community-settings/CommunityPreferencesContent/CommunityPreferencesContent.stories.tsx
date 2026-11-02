import { Box, Button } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityPreferencesContent } from "./CommunityPreferencesContent"

const meta = {
  title: "Features/Community Settings/Accent Draft",
  component: CommunityPreferencesContent,
  args: {
    accent: "#123456",
    setAccent: fn(),
    isPreview: true,
  },
  decorators: [(Story) => <Box maw={760} p="md"><Story /></Box>],
} satisfies Meta<typeof CommunityPreferencesContent>
export default meta
type Story = StoryObj<typeof meta>

function AccentRefreshFixture(args: ComponentProps<typeof CommunityPreferencesContent>) {
  const [accent, setAccent] = useState(args.accent)
  const [preserveDraft, setPreserveDraft] = useState(false)
  return (
    <>
      <Button onClick={() => setAccent("#654321")}>アクセント再取得を再現</Button>
      <Button onClick={() => { setPreserveDraft(true); setAccent("#ABCDEF") }}>
        保存失敗の復元を再現
      </Button>
      <CommunityPreferencesContent
        {...args}
        accent={accent}
        preserveDraftOnAccentChange={preserveDraft}
        setAccent={setAccent}
      />
    </>
  )
}

export const AccentRefreshWhileUntouched: Story = {
  name: "Interaction · 未編集ならAccent取得値に追従",
  tags: ["interaction"],
  render: (args) => <AccentRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "アクセント再取得を再現" }))
    await expect(canvas.getByRole("textbox", { name: "Communityアクセントカラー" })).toHaveValue(
      "#654321",
    )
  },
}

export const AccentPreservesIncompleteDraft: Story = {
  name: "Interaction · 未完成HEX入力を再取得から保護",
  tags: ["interaction"],
  render: (args) => <AccentRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Communityアクセントカラー" })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await userEvent.click(canvas.getByRole("button", { name: "アクセント再取得を再現" }))
    await expect(input).toHaveValue("#123")
  },
}

export const AccentRollbackPreservesDraft: Story = {
  name: "Interaction · 保存失敗時もColorInput Draftを保持",
  tags: ["interaction"],
  render: (args) => <AccentRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Communityアクセントカラー" })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await userEvent.click(canvas.getByRole("button", { name: "保存失敗の復元を再現" }))
    await expect(input).toHaveValue("#123")
  },
}
