import { Box, Button, Text } from "@mantine/core"
import { useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { SettingsSectionContent } from "./SettingsSectionContent"
import { defaultUserPreferences, type UserPreferencesPatch } from "../preferences/userPreferences"
import { PersonalPreferencesSessionProvider } from "../preferences/PersonalPreferencesSessionContext"

const meta = {
  title: "Features/Settings/Preferences",
  component: SettingsSectionContent,
  args: {
    section: "profile",
    profileNickname: "テストユーザー",
    saveProfile: fn(async () => undefined),
    usageContent: <Text>利用状況の表示領域</Text>,
  },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof SettingsSectionContent>
export default meta
type Story = StoryObj<typeof meta>

export const Preferences: Story = {
  name: "Visual · 環境設定",
  tags: ["visual"],
  args: { section: "preferences" },
}

export const PreferenceSections: Story = {
  name: "Interaction · 設定項目の表示",
  tags: ["interaction"],
  args: { section: "preferences" },
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
  args: { section: "preferences" },
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
    section: "preferences",
    savePreferences: fn(async () => ({ ...defaultUserPreferences, mediaDetailNavigationWrap: true })),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]
    await userEvent.click(input)
    await waitFor(() => {
      expect(args.savePreferences).toHaveBeenCalledWith({ mediaDetailNavigationWrap: true })
    })
  },
}

export const PreferenceSaveStatus: Story = {
  name: "Interaction · 自動保存のタイトル横Status",
  tags: ["interaction"],
  args: {
    section: "preferences",
    savePreferences: fn(async (patch: UserPreferencesPatch) => ({
      ...defaultUserPreferences,
      ...patch,
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]

    await expect(canvas.queryByText("保存済み")).not.toBeInTheDocument()
    await userEvent.click(input)
    await expect(canvas.getByText("保存待ち")).toBeVisible()
    await waitFor(() => {
      expect(canvas.getByText("保存済み")).toBeVisible()
    })
  },
}

function PreferencesSessionRoundTripFixture(
  args: ComponentProps<typeof SettingsSectionContent>,
) {
  const [show, setShow] = useState(true)
  return (
    <PersonalPreferencesSessionProvider>
      <Button onClick={() => setShow((previous) => !previous)}>
        {show ? "設定画面から移動" : "設定画面へ戻る"}
      </Button>
      {show && (
        <SettingsSectionContent
          {...args}
          section="preferences"
          initialPreferences={defaultUserPreferences}
          savePreferences={async (patch) => ({
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

function PreferencesRefreshFixture(args: ComponentProps<typeof SettingsSectionContent>) {
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
      <SettingsSectionContent
        {...args}
        section="preferences"
        initialPreferences={preferences}
      />
    </>
  )
}

export const PreferencesRefreshWhileUntouched: Story = {
  name: "Interaction · Preferences未編集Fieldは再取得値へ追従",
  tags: ["interaction"],
  args: { savePreferences: fn(async () => defaultUserPreferences) },
  render: (args) => <PreferencesRefreshFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getAllByRole("switch")[0]
    await expect(input).not.toBeChecked()
    await userEvent.click(canvas.getByRole("button", { name: "Preferences再取得を再現" }))
    await expect(input).toBeChecked()
    await expect(args.savePreferences).not.toHaveBeenCalled()
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
