import { Box, Button } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityAliasControl } from "./CommunityAliasControl"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"

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
      throw { kind: "retryable" }
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
        "入力内容を保持しています。再度保存してください。",
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
      throw new SettingsInputValidationError([
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
  args: { onSave: fn(async () => { throw new Error("timeout") }) },
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
  args: ComponentProps<typeof CommunityAliasControl>,
) {
  const [alias, setAlias] = useState(args.savedAlias)
  return (
    <>
      <Button onClick={() => setAlias("取得した新しい別名")}>
        Alias再取得を再現
      </Button>
      <CommunityAliasControl {...args} savedAlias={alias} />
    </>
  )
}

export const AliasRefreshWhileUntouched: Story = {
  name: "Interaction · Alias未編集時は再取得した値を表示",
  tags: ["interaction"],
  render: (args) => <AliasRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole("button", { name: "Alias再取得を再現" }),
    )
    await expect(
      canvas.getByRole("textbox", { name: "Community別名" }),
    ).toHaveValue("取得した新しい別名")
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
  name: "Interaction · 編集を元に戻したら再取得値へ追従",
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
    await expect(input).toHaveValue("取得した新しい別名")
    await expect(save).toBeDisabled()
  },
}


export const AliasUnknownMatches: Story = {
  name: "Interaction · 現在のAliasが一致したら明示確認",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => { throw new Error("response lost") }),
    onInspect: fn(async () => "変更した別名"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "変更した別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "確認完了" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("成功した証明ではありません")
    await userEvent.click(canvas.getByRole("button", { name: "確認完了" }))
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(input).toHaveValue("変更した別名")
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const AliasUnknownDiffers: Story = {
  name: "Visual · Alias現在値とDraft不一致・復旧Action",
  tags: ["visual"],
  args: {
    onSave: fn(async () => { throw new Error("unknown") }),
    onInspect: fn(async () => "現在の別名"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "新しい別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "もう一度保存" })).toBeEnabled()
    await expect(canvas.getByRole("button", { name: "変更を破棄" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("現在の別名")
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const AliasUnknownInspectFailure: Story = {
  name: "Interaction · Alias現在値照会失敗では再送しない",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => { throw new Error("uncertain") }),
    onInspect: fn(async () => { throw new Error("read failed") }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定の別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByText("現在のCommunity別名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。")).toBeVisible()
    await expect(canvas.queryByRole("button", { name: "もう一度保存" })).not.toBeInTheDocument()
    await expect(input).toHaveValue("未確定の別名")
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const AliasUnknownDiscard: Story = {
  name: "Interaction · Alias不一致時に現在値を採用してDraft破棄",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => { throw new Error("unknown") }),
    onInspect: fn(async () => null),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定の別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "変更を破棄" })).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "変更を破棄" }))
    await expect(input).toHaveValue("")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const AliasBlockedUserDeleting: Story = {
  name: "Visual · Alias更新不可（削除処理中）",
  tags: ["visual"],
  args: {
    onSave: fn(async () => {
      throw { graphQLErrors: [{ extensions: { code: "USER_DELETING" } }] }
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

export const AliasFormValidationPanel: Story = {
  name: "Visual · Alias Form-level Validationの持続表示",
  tags: ["visual"],
  args: {
    onSave: fn(async () => {
      throw new SettingsInputValidationError([
        { scope: "FORM", code: "INVALID_COMBINATION", inputPaths: [] },
      ])
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "更新する別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("入力内容を確認してください")
    await userEvent.type(input, "を再編集")
    await expect(canvas.getByRole("alert")).toBeVisible()
  },
}
