import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { ContextSwitcherDialog } from "./ContextSwitcherDialog"

const personal = { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" }
const family = { id: "family", kind: "community" as const, label: "家族のアルバム", accentColor: "var(--mantine-color-teal-6)" }
const travel = { id: "travel", kind: "community" as const, label: "旅行の思い出", accentColor: "var(--mantine-color-violet-6)" }
const meta = {
  title: "Features/Application Shell/Context Switcher/Dialog",
  component: ContextSwitcherDialog,
  parameters: { layout: "fullscreen" },
  args: { opened: true, onClose: fn(), currentContext: personal, contexts: [personal, family, travel], search: "", onSearchChange: fn(), onSelect: fn(), onCreateCommunity: fn(), onRetry: fn(), loading: false, error: false },
} satisfies Meta<typeof ContextSwitcherDialog>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { name: "Visual · Context一覧", tags: ["visual", "vrt", "vrt-modal"] }
export const Community: Story = { name: "Visual · Community選択中", tags: ["visual", "vrt", "vrt-modal"], args: { currentContext: family } }
export const Empty: Story = { name: "Visual · Communityなし", tags: ["visual", "vrt", "vrt-modal"], args: { contexts: [personal] } }
export const Error: Story = { name: "Visual · 取得失敗", tags: ["visual", "vrt", "vrt-modal"], args: { error: true } }
