import { Box, Button } from "@mantine/core"
import { useRef, useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { CommunityAliasSection } from "./CommunityAliasSection"
import type { CommunityAliasSaveRejection } from "./communityAliasSaveOutcome"

const success = (alias: string | null) => ({ kind: "success" as const, value: alias })
const unknown = () => ({ kind: "unknown" as const })
const validation = (violations: Extract<CommunityAliasSaveRejection, { kind: "validation" }>["violations"]) => ({
  kind: "rejected" as const, reason: { kind: "validation" as const, violations },
})

const meta = {
  title: "features/community-settings/preferences/CommunityAliasSection",
  component: CommunityAliasSection,
  args: {
    savedAlias: "元の別名",
    onSave: fn(async (alias: string | null) => success(alias)),
  },
  decorators: [
    (Story) => (
      <Box maw={560} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunityAliasSection>
export default meta
type Story = StoryObj<typeof meta>

export const ClearAlias: Story = {
  name: "Interaction · 空欄によるAlias解除",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(
      canvas.getByRole("textbox", { name: "Community別名" }),
    )
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSave).toHaveBeenCalledWith(null)
  },
}

export const AliasConfirmedBeforeRefetch: Story = {
  name: "Interaction · 保存成功後は再取得前でも未編集扱い",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    const save = canvas.getByRole("button", { name: "保存" })
    await userEvent.clear(input)
    await userEvent.type(input, "確定した別名")
    await userEvent.click(save)
    await expect(args.onSave).toHaveBeenCalledWith("確定した別名")
    await expect(input).toHaveValue("確定した別名")
    await expect(save).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
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
    await expect(canvas.queryByText("100文字以内で入力してください。")).not.toBeInTheDocument()
    await userEvent.tab()
    await expect(
      canvas.getByText("100文字以内で入力してください。"),
    ).toBeVisible()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await userEvent.clear(input)
    await userEvent.type(input, "有効な別名")
    await expect(canvas.queryByText("100文字以内で入力してください。")).not.toBeInTheDocument()
    // An already touched field validates again while editing.
    await userEvent.clear(input)
    await userEvent.type(input, "あ".repeat(101))
    await expect(canvas.getByText("100文字以内で入力してください。")).toBeVisible()
  },
}

export const AliasRetry: Story = {
  name: "Interaction · 保存失敗後にDraftを保持",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      return { kind: "rejected" as const, reason: { kind: "retryable" as const } }
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "未保存の別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(
      await canvas.findByText(
        "入力内容を保持しています。もう一度保存してください。",
      ),
    ).toBeVisible()
    await expect(input).toHaveValue("未保存の別名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()
  },
}

export const AliasServerFieldValidation: Story = {
  name: "Interaction · API Alias Field Error",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      return validation([
        { scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["alias"] }] },
      ])
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("文字数が上限を超えています。")).toBeVisible()
    await expect(input).toHaveValue("変更した別名")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const AliasUnknownOutcome: Story = {
  name: "Interaction · Alias結果不明時の二重送信防止",
  tags: ["interaction"],
  args: { onSave: fn(async () => { return unknown() }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("保存結果を確認できませんでした")).toBeVisible()
    await expect(input).toHaveValue("変更した別名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

function AliasRefreshFixture(
  args: ComponentProps<typeof CommunityAliasSection>,
) {
  const [alias, setAlias] = useState(args.savedAlias)
  return (
    <>
      <Button onClick={() => setAlias("取得した新しい別名")}>
        Alias再取得を再現
      </Button>
      <CommunityAliasSection {...args} savedAlias={alias} />
    </>
  )
}

export const AliasRefreshWhileUntouched: Story = {
  name: "Interaction · 表示後のQuery値は自動反映しない",
  tags: ["interaction"],
  render: (args) => <AliasRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole("button", { name: "Alias再取得を再現" }),
    )
    await expect(
      canvas.getByRole("textbox", { name: "Community別名" }),
    ).toHaveValue("元の別名")
  },
}

export const AliasRefreshArrivesWhileEditingThenReverted: Story = {
  name: "Interaction · Draft復帰後も取得値を自動採用しない",
  tags: ["interaction"],
  render: (args) => <AliasRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    const save = canvas.getByRole("button", { name: "保存" })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のDraft")
    await userEvent.click(canvas.getByRole("button", { name: "Alias再取得を再現" }))
    await expect(input).toHaveValue("編集中のDraft")
    await userEvent.clear(input)
    await userEvent.type(input, "元の別名")
    await expect(input).toHaveValue("元の別名")
    await expect(save).toBeDisabled()
  },
}

export const AliasRefreshWhileEditing: Story = {
  name: "Interaction · Alias編集中は再取得でDraftを失わない",
  tags: ["interaction"],
  render: (args) => <AliasRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "未保存の別名")
    await userEvent.click(
      canvas.getByRole("button", { name: "Alias再取得を再現" }),
    )
    await expect(input).toHaveValue("未保存の別名")
  },
}

export const AliasRefreshAfterRevert: Story = {
  name: "Interaction · 編集を戻しても取得値へ追従しない",
  tags: ["interaction"],
  render: (args) => <AliasRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    const save = canvas.getByRole("button", { name: "保存" })

    await userEvent.clear(input)
    await userEvent.type(input, "一時的な別名")
    await expect(save).toBeEnabled()

    await userEvent.clear(input)
    await userEvent.type(input, "元の別名")
    await expect(save).toBeDisabled()

    await userEvent.click(
      canvas.getByRole("button", { name: "Alias再取得を再現" }),
    )
    await expect(input).toHaveValue("元の別名")
    await expect(save).toBeDisabled()
  },
}


export const AliasSaveStaleQuery: Story = {
  name: "Interaction · 保存成功後は古い再取得値で確定Aliasを巻き戻さない",
  tags: ["interaction"],
  render: (args) => <AliasRefreshFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "確定した別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSave).toHaveBeenCalledWith("確定した別名")
    await expect(input).toHaveValue("確定した別名")
    await userEvent.click(canvas.getByRole("button", { name: "Alias再取得を再現" }))
    await expect(input).toHaveValue("確定した別名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const AliasNormalizedSave: Story = {
  name: "Interaction · Aliasの前後空白をTrimして保存",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "  正規化した別名  ")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSave).toHaveBeenCalledWith("正規化した別名")
    await expect(input).toHaveValue("正規化した別名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const AliasBlockedUserDeleting: Story = {
  name: "Interaction · Alias更新不可（削除処理中）",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      return { kind: "rejected" as const, reason: { kind: "blocked" as const, error: { graphQLErrors: [{ extensions: { code: "USER_DELETING" } }] } } }
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "未保存の別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("アカウントの削除処理中です")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

