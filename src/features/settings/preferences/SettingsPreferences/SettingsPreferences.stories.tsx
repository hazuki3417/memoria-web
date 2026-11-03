import { Box, Button } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { SettingsPreferences } from "./SettingsPreferences"
import { defaultUserPreferences, type UserPreferencesPatch } from "../userPreferences"
import { PersonalPreferencesSessionProvider } from "../PersonalPreferencesSessionContext"
import { SettingsInputValidationError } from "../../graphqlSettingsResult"

const meta = {
  title: "features/settings/preferences/SettingsPreferences",
  component: SettingsPreferences,
  args: {
    compact: false,
    initialPreferences: defaultUserPreferences,
  },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SettingsPreferences>
export default meta
type Story = StoryObj<typeof meta>

export const Preferences: Story = {
  name: "Visual · 環境設定",
  tags: ["visual"],
}

export const PreferenceSections: Story = {
  name: "Interaction · 設定項目の表示",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const label of [
      "表示テーマ",
      "Personal Accent Color",
      "日付形式",
      "ファイルサイズの単位",
      "Mediaサムネイルサイズ",
    ]) {
      await expect(canvas.getByLabelText(label)).toBeVisible()
    }
    await expect(
      canvas.getByText("Media Detailの前後Navigation循環"),
    ).toBeVisible()
    await expect(canvas.getByText("詳細情報の初期表示（Wide）")).toBeVisible()
    await expect(canvas.getByText("詳細情報の初期表示（Medium）")).toBeVisible()
  },
}

export const PreviewToggle: Story = {
  name: "Interaction · Media Detail循環設定",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const row = canvas
      .getByText("Media Detailの前後Navigation循環")
      .closest("div")
    await expect(row).not.toBeNull()
    const input = canvas.getAllByRole("switch")[0]
    const previous = (input as HTMLInputElement).checked
    await userEvent.click(input)
    await expect(input).toHaveProperty("checked", !previous)
  },
}

export const PreferencePatchContract: Story = {
  name: "Interaction · 編集したFieldだけを自動保存",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => ({ ...defaultUserPreferences, mediaDetailNavigationWrap: true })),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]
    await userEvent.click(input)
    await waitFor(async () => {
      await expect(args.onSave).toHaveBeenCalledWith({
        mediaDetailNavigationWrap: true,
      })
    })
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const PreferencesTypedFieldValidation: Story = {
  name: "Interaction · Preferences Server Field Errorと明示復旧",
  tags: ["interaction"],
  args: {
    onSave: fn(async () => {
      throw new SettingsInputValidationError([
        {
          scope: "FIELD",
          code: "INVALID_VALUE",
          inputPaths: [{ segments: ["mediaDetailNavigationWrap"] }],
        },
      ])
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]
    await userEvent.click(input)
    await expect(await canvas.findByText("入力内容を確認してください。")).toBeVisible()
    await expect(input).toBeChecked()
    await expect(canvas.getByRole("button", { name: "もう一度保存" })).toBeVisible()
    await expect(args.onSave).toHaveBeenCalledTimes(1)
  },
}

export const PreferenceSaveStatus: Story = {
  name: "Interaction · 自動保存のタイトル横Status",
  tags: ["interaction"],
  args: {
    onSave: fn(async (patch: UserPreferencesPatch) => ({
      ...defaultUserPreferences,
      ...patch,
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]

    await expect(canvas.getByText("保存済み")).not.toBeVisible()
    await userEvent.click(input)
    await expect(canvas.getByText("保存待ち")).toBeVisible()
    await waitFor(() => {
      expect(canvas.getByText("保存済み")).toBeVisible()
    })
  },
}

function PreferencesSessionRoundTripFixture(
  args: ComponentProps<typeof SettingsPreferences>,
) {
  const [show, setShow] = useState(true)
  return (
    <PersonalPreferencesSessionProvider>
      <Button onClick={() => setShow((previous) => !previous)}>
        {show ? "設定画面から移動" : "設定画面へ戻る"}
      </Button>
      {show && (
        <SettingsPreferences
          {...args}
          compact={false}
          initialPreferences={defaultUserPreferences}
          onSave={async (patch) => ({
            ...defaultUserPreferences,
            ...patch,
          })}
        />
      )}
    </PersonalPreferencesSessionProvider>
  )
}

export const PreferencesSessionRoundTrip: Story = {
  name: "Interaction · SPA画面再訪で未保存DraftとBadgeを保持",
  tags: ["interaction"],
  render: (args) => <PreferencesSessionRoundTripFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]
    await userEvent.click(input)
    await expect(input).toBeChecked()
    await userEvent.click(canvas.getByRole("button", { name: "設定画面から移動" }))
    await userEvent.click(canvas.getByRole("button", { name: "設定画面へ戻る" }))
    const restored = canvas.getAllByRole("switch")[0]
    await expect(restored).toBeChecked()
    await waitFor(() => {
      expect(canvas.getByText("保存済み")).toBeVisible()
    })
  },
}

function PreferencesRefreshFixture(args: ComponentProps<typeof SettingsPreferences>) {
  const [preferences, setPreferences] = useState(defaultUserPreferences)
  return (
    <>
      <Button onClick={() => setPreferences((current) => ({
        ...current,
        mediaDetailNavigationWrap: true,
        mediaDetailInitialInfoMedium: true,
      }))}>
        Preferences再取得を再現
      </Button>
      <Button onClick={() => setPreferences((current) => ({
        ...current,
        mediaDetailInitialInfoMedium: true,
      }))}>
        別Fieldのみ再取得を再現
      </Button>
      <SettingsPreferences
        {...args}
        compact={false}
        initialPreferences={preferences}
      />
    </>
  )
}

export const PreferencesRefreshWhileUntouched: Story = {
  name: "Interaction · Preferences未編集Fieldは再取得値へ追従",
  tags: ["interaction"],
  args: { onSave: fn(async () => defaultUserPreferences) },
  render: (args) => <PreferencesRefreshFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]
    await expect(input).not.toBeChecked()
    await userEvent.click(canvas.getByRole("button", { name: "Preferences再取得を再現" }))
    await expect(input).toBeChecked()
    // RHF reset/hydration must never enqueue a new auto-save patch.
    await new Promise((resolve) => setTimeout(resolve, 500))
    await expect(args.onSave).not.toHaveBeenCalled()
  },
}

export const PreferencesAccentValidationOnBlur: Story = {
  name: "Interaction · Personal AccentのValidationはBlur後に表示",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Personal Accent Color" })
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

export const PreferencesInvalidAccentDraft: Story = {
  name: "Interaction · 未完成HEXは保存Patchに含めない",
  tags: ["interaction"],
  args: {
    onSave: fn(async (patch: UserPreferencesPatch) => ({
      ...defaultUserPreferences,
      ...patch,
    })),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Personal Accent Color" })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await expect(input).toHaveValue("#123")
    // Check after the auto-save debounce window, not only immediately.
    await new Promise((resolve) => setTimeout(resolve, 500))
    await expect(args.onSave).not.toHaveBeenCalled()
  },
}

export const PreferencesRefreshWhileEditing: Story = {
  name: "Interaction · Preferences編集中Fieldを再取得で保護",
  tags: ["interaction"],
  render: (args) => <PreferencesRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switches = canvas.getAllByRole("switch")
    await userEvent.click(switches[0])
    await expect(switches[0]).toBeChecked()
    await userEvent.click(canvas.getByRole("button", { name: "別Fieldのみ再取得を再現" }))
    await expect(switches[0]).toBeChecked()
    await expect(switches[2]).toBeChecked()
  },
}


function PreferencesFeedbackSessionFixture(
  args: ComponentProps<typeof SettingsPreferences>,
) {
  return (
    <PersonalPreferencesSessionProvider>
      <SettingsPreferences {...args} />
    </PersonalPreferencesSessionProvider>
  )
}

export const PreferencesFormErrorVisual: Story = {
  name: "Visual · Personal PreferencesのForm Error",
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
    await userEvent.click(canvas.getAllByRole("switch")[0])
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "入力内容を確認してください",
    )
    await expect(canvas.getByRole("button", { name: "もう一度保存" })).toBeVisible()
  },
}

export const PreferencesRetryableVisual: Story = {
  name: "Visual · Personal Preferencesの再試行可能な保存失敗",
  tags: ["visual"],
  args: {
    onSave: fn(async () => { throw { kind: "retryable" } }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole("switch")[0])
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "保存できませんでした",
    )
    await expect(canvas.getByRole("button", { name: "もう一度保存" })).toBeVisible()
  },
}

export const PreferencesBlockedVisual: Story = {
  name: "Visual · Personal Preferencesの操作不可",
  tags: ["visual"],
  args: {
    onSave: fn(async () => {
      throw { graphQLErrors: [{ extensions: { code: "USER_DELETING" } }] }
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole("switch")[0])
    await expect(await canvas.findByRole("alert")).toHaveTextContent("アカウントの削除処理中です")
    await expect(canvas.queryByRole("button", { name: "変更を破棄" })).not.toBeInTheDocument()
  },
}

export const PreferencesUnknownMatchesVisual: Story = {
  name: "Visual · Personal PreferencesのUnknown照会一致",
  tags: ["visual"],
  render: (args) => <PreferencesFeedbackSessionFixture {...args} />,
  args: {
    onSave: fn(async () => { throw new Error("unknown") }),
    onInspect: fn(async () => ({
      ...defaultUserPreferences,
      mediaDetailNavigationWrap: true,
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole("switch")[0])
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "保存結果を確認できませんでした",
    )
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "確認完了" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("先ほどの保存が成功したことを示すものではありません")
  },
}

export const PreferencesUnknownDiffersVisual: Story = {
  name: "Visual · Personal PreferencesのUnknown照会不一致",
  tags: ["visual"],
  render: (args) => <PreferencesFeedbackSessionFixture {...args} />,
  args: {
    onSave: fn(async () => { throw new Error("unknown") }),
    onInspect: fn(async () => defaultUserPreferences),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole("switch")[0])
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "もう一度保存" })).toBeVisible()
    await expect(canvas.getByRole("button", { name: "変更を破棄" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("一致しません")
  },
}
