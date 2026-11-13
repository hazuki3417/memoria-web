"use client"

import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { defaultUserPreferences } from "../userPreferences"
import { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"
import { PersonalPreferencesDisplaySection } from "./PersonalPreferencesDisplaySection"

const Fixture = ({ compact = false }: { compact?: boolean }) => {
  const model = usePersonalPreferencesForm(defaultUserPreferences)
  return <PersonalPreferencesDisplaySection compact={compact} model={model} />
}

const meta = {
  title: "features/settings/preferences/PersonalPreferencesDisplaySection",
  component: Fixture,
  args: { compact: false },
  decorators: [(Story) => <Box maw={760} p="md"><Story /></Box>],
} satisfies Meta<typeof Fixture>
export default meta
type Story = StoryObj<typeof meta>

export const Display: Story = {
  name: "Visual · Display Section",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("表示")).toBeVisible()
    for (const label of ["表示テーマ", "Personal Accent Color", "日付形式", "ファイルサイズの単位", "Mediaサムネイルサイズ"]) {
      await expect(canvas.getByLabelText(label)).toBeVisible()
    }
  },
}

export const AccentDraft: Story = {
  name: "Interaction · Sectionの未完成Accent Draft",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Personal Accent Color" })
    await userEvent.clear(input)
    await userEvent.type(input, "#123")
    await expect(input).toHaveValue("#123")
    await userEvent.tab()
    await expect(canvas.getByText("HEXカラーコード（#RRGGBB）を入力してください。")).toBeVisible()
  },
}
