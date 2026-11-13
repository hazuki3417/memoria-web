"use client"

import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { defaultUserPreferences } from "../userPreferences"
import { usePersonalPreferencesForm } from "../usePersonalPreferencesForm"
import { PersonalPreferencesPreviewSection } from "./PersonalPreferencesPreviewSection"

const Fixture = ({ compact = false }: { compact?: boolean }) => {
  const model = usePersonalPreferencesForm(defaultUserPreferences)
  return <PersonalPreferencesPreviewSection compact={compact} model={model} />
}

const meta = {
  title: "features/settings/preferences/PersonalPreferencesPreviewSection",
  component: Fixture,
  args: { compact: false },
  decorators: [(Story) => <Box maw={760} p="md"><Story /></Box>],
} satisfies Meta<typeof Fixture>
export default meta
type Story = StoryObj<typeof meta>

export const Preview: Story = {
  name: "Visual · Preview Section",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("プレビュー")).toBeVisible()
    for (const label of ["Media Detailの前後Navigation循環", "詳細情報の初期表示（Wide）", "詳細情報の初期表示（Medium）"]) {
      await expect(canvas.getByText(label)).toBeVisible()
    }
  },
}

export const Compact: Story = {
  name: "Visual · Preview Section（Compact）",
  tags: ["visual"],
  args: { compact: true },
}

export const NavigationWrap: Story = {
  name: "Interaction · SectionのNavigation循環を変更",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const control = canvas.getAllByRole("switch")[0]
    await expect(control).not.toBeChecked()
    await userEvent.click(control)
    await expect(control).toBeChecked()
  },
}

export const InitialInfo: Story = {
  name: "Interaction · Wide/Mediumの詳細情報初期表示を変更",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switches = canvas.getAllByRole("switch")
    await expect(switches).toHaveLength(3)
    for (const control of [switches[1], switches[2]]) {
      const wasChecked = (control as HTMLInputElement).checked
      await userEvent.click(control)
      await expect(control).toHaveProperty("checked", !wasChecked)
    }
  },
}
