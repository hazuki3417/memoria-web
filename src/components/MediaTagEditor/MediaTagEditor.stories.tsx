import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { MediaTagEditor, type MediaTagEditorItem } from "./MediaTagEditor"

const initialItems: MediaTagEditorItem[] = [
  { id: "1", label: "Media 1", tags: ["旅行", "夏"] },
  { id: "2", label: "Media 2", tags: ["旅行"] },
  { id: "3", label: "Media 3", tags: [] },
]

function Demo() {
  const [items, setItems] = useState(initialItems)
  const [selectedIds, setSelectedIds] = useState(items.map((item) => item.id))
  return <MediaTagEditor
    items={items}
    selectedIds={selectedIds}
    onSelectedIdsChange={setSelectedIds}
    onTagsChange={(id, tags) => setItems((current) => current.map((item) => item.id === id ? { ...item, tags } : item))}
  />
}

const meta = {
  title: "Components/Media Tag Editor",
  component: MediaTagEditor,
} satisfies Meta<typeof MediaTagEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <Demo /> }
