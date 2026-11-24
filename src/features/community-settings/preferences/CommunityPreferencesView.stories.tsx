import { Box, Button } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunityPreferencesStoryView as CommunityPreferencesView } from "./CommunityPreferencesStoryView"

const meta = {
  title: "features/community-settings/preferences/CommunityPreferencesView",
  component: CommunityPreferencesView,
  args: {
    accent: "#123456",
    setAccent: fn(),
    isPreview: true,
  },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunityPreferencesView>
export default meta
type Story = StoryObj<typeof meta>

function AccentRefreshFixture(
  args: ComponentProps<typeof CommunityPreferencesView>,
) {
  const [accent, setAccent] = useState(args.accent)
  const [preserveDraft, setPreserveDraft] = useState(false)
  return (
    <>
      <Button onClick={() => setAccent("#654321")}>
        アクセント再取得を再現
      </Button>
      <Button
        onClick={() => {
          setPreserveDraft(true)
          setAccent("#ABCDEF")
        }}
      >
        保存失敗の復元を再現
      </Button>
      <CommunityPreferencesView
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
    await userEvent.click(
      canvas.getByRole("button", { name: "アクセント再取得を再現" }),
    )
    await expect(
      canvas.getByRole("textbox", { name: "Communityアクセントカラー" }),
    ).toHaveValue("#654321")
  },
}

export const AccentPreservesIncompleteDraft: Story = {
  name: "Interaction · 未完成HEX入力を再取得から保護",
  tags: ["interaction"],
  render: (args) => <AccentRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", {
      name: "Communityアクセントカラー",
    })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await userEvent.click(
      canvas.getByRole("button", { name: "アクセント再取得を再現" }),
    )
    await expect(input).toHaveValue("#123")
  },
}

export const AccentIncompleteDraftDoesNotPreview: Story = {
  name: "Interaction · 未完成HEXはPreviewへ通知しない",
  tags: ["interaction"],
  args: { setAccent: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", {
      name: "Communityアクセントカラー",
    })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await expect(input).toHaveValue("#123")
    await expect(args.setAccent).not.toHaveBeenCalled()
  },
}

export const AccentClientValidationOnBlur: Story = {
  name: "Interaction · 未完成HEXはBlur後にのみError表示",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Communityアクセントカラー" })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await expect(canvas.queryByText("HEXカラーコード（#RRGGBB）を入力してください。")).not.toBeInTheDocument()
    await userEvent.tab()
    await expect(canvas.getByText("HEXカラーコード（#RRGGBB）を入力してください。")).toBeVisible()
    await userEvent.clear(input)
    await userEvent.type(input, "#ABCDEF")
    await expect(canvas.queryByText("HEXカラーコード（#RRGGBB）を入力してください。")).not.toBeInTheDocument()
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await expect(canvas.getByText("HEXカラーコード（#RRGGBB）を入力してください。")).toBeVisible()
  },
}

export const AccentRollbackPreservesDraft: Story = {
  name: "Interaction · 保存失敗時もColorInput Draftを保持",
  tags: ["interaction"],
  render: (args) => <AccentRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", {
      name: "Communityアクセントカラー",
    })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await userEvent.click(
      canvas.getByRole("button", { name: "保存失敗の復元を再現" }),
    )
    await expect(input).toHaveValue("#123")
  },
}

export const AccentStatusBadge: Story = {
  name: "Visual · Community Accentの保存Badge",
  tags: ["visual"],
  args: {
    accent: "#123456",
    isPreview: false,
    saveStatus: "saved",
  },
}

export const AccentErrorBadge: Story = {
  name: "Visual · 保存エラー時のBadge",
  tags: ["visual"],
  args: {
    accent: "#123456",
    isPreview: false,
    saveStatus: "attention",
  },
}

export const AccentErrorWithDetails: Story = {
  name: "Visual · Header Badgeと下部の保存Error詳細",
  tags: ["visual"],
  args: {
    accent: "#123456",
    isPreview: false,
    saveStatus: "attention",
    saveFeedback: (
      <FeedbackPanel kind="error" title="保存できませんでした" role="alert">
        選択した色は保存結果が未確定でも表示を維持しています。ColorInputの変更内容は保持しています。
      </FeedbackPanel>
    ),
  },
}


export const AccentUnknownBeforeInspection: Story = {
  name: "Visual · Community Accentの保存結果未確定",
  tags: ["visual"],
  args: {
    isPreview: false,
    saveStatus: "attention",
    saveFeedback: (
      <FeedbackPanel
        kind="warning"
        title="保存結果を確認できませんでした"
        role="alert"
        actions={
          <>
            <Button size="xs" variant="light">現在の状態を確認</Button>
            <Button size="xs" variant="subtle" color="gray">変更を破棄</Button>
          </>
        }
      >
        選択した色を表示しています。入力内容は保持しています。
        現在値を確認してから必要な操作を選んでください。
      </FeedbackPanel>
    ),
  },
}

export const AccentUnknownInspected: Story = {
  name: "Visual · Community Accentの現在値照会一致",
  tags: ["visual"],
  args: {
    isPreview: false,
    saveStatus: "attention",
    saveFeedback: (
      <FeedbackPanel
        kind="warning"
        title="保存結果を確認できませんでした"
        role="alert"
        actions={
          <>
            <Button size="xs" variant="light">現在の状態を確認</Button>
            <Button size="xs" variant="light">確認完了</Button>
            <Button size="xs" variant="subtle" color="gray">変更を破棄</Button>
          </>
        }
      >
        現在の色は入力した値と一致しています。元の保存処理が成功した証明ではありません。
      </FeedbackPanel>
    ),
  },
}

export const AccentBlockedPanel: Story = {
  name: "Visual · Community Accentの操作不可",
  tags: ["visual"],
  args: {
    isPreview: false,
    saveStatus: "attention",
    saveFeedback: (
      <FeedbackPanel
        kind="error"
        title="Community設定を変更できません"
        role="alert"
      >
        権限またはセッションの状態を確認してから再読み込みしてください。
      </FeedbackPanel>
    ),
  },
}

export const AccentValidationPanel: Story = {
  name: "Visual · Community AccentのServer Validation",
  tags: ["visual"],
  args: {
    isPreview: false,
    saveStatus: "attention",
    accentError: "HEXカラーコード（#RRGGBB）を入力してください。",
    saveFeedback: (
      <FeedbackPanel
        kind="error"
        title="入力内容を確認してください"
        role="alert"
        actions={
          <>
            <Button size="xs">もう一度保存</Button>
            <Button size="xs" variant="subtle" color="gray">変更を破棄</Button>
          </>
        }
      >
        入力内容を修正したうえで再保存するか、変更を破棄してください。
      </FeedbackPanel>
    ),
  },
}

/** Productionと同じView/Form/AutoSaveの経路で、Aliasの編集中Draftを保護する。 */
export const AccentRecoveryPreservesAliasDraft: Story = {
  name: "Interaction · Accentの明示破棄でAlias Draftを保持",
  tags: ["interaction"],
  args: {
    accent: "#123456",
    isPreview: false,
    operations: {
      save: fn(async () => ({ kind: "unknown" as const })),
      observe: fn(async () => ({ accentColor: "#123456" })),
      confirm: fn(),
    },
    preview: { preview: fn(() => 1), release: fn() },
    alias: {
      savedAlias: "保存済み別名",
      onSave: fn(async (value: string | null) => ({ kind: "success" as const, value })),
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const aliasInput = canvas.getByRole("textbox", { name: "Community別名" })
    const accentInput = canvas.getByRole("textbox", { name: "Communityアクセントカラー" })
    await userEvent.clear(aliasInput)
    await userEvent.type(aliasInput, "未保存の別名")
    await userEvent.clear(accentInput)
    await userEvent.type(accentInput, "#AABBCC")
    await expect(await canvas.findByText("保存結果を確認できませんでした")).toBeVisible()
    await expect(args.operations?.save).toHaveBeenCalledWith({ accentColor: "#AABBCC" })
    await expect(args.preview?.preview).toHaveBeenCalledWith("#AABBCC")
    await userEvent.click(canvas.getByRole("button", { name: "変更を破棄" }))
    await expect(accentInput).toHaveValue("#123456")
    await expect(aliasInput).toHaveValue("未保存の別名")
    await expect(args.alias?.onSave).not.toHaveBeenCalled()
    await expect(args.preview?.release).toHaveBeenCalledWith(1)
  },
}
