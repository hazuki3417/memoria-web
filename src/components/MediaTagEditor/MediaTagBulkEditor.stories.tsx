import type { Meta, StoryObj } from "@storybook/react"
import { MediaTagBulkEditor } from "./MediaTagBulkEditor"

const meta = {
  title: "Components/Media Tag Editor/Bulk Editor",
  component: MediaTagBulkEditor,
  args: {
    selectedCount: 2,
    allSelected: false,
    indeterminate: true,
    value: "",
    summaryItems: [
      { label: "Media登録済み", value: "1件" },
      { label: "画像処理中", value: "1件" },
      { label: "完了", value: "0件" },
    ],
    onToggleAll: () => undefined,
    onChange: () => undefined,
    onAction: () => undefined,
  },
} satisfies Meta<typeof MediaTagBulkEditor>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
