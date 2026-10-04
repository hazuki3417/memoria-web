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
  const [bulkTag, setBulkTag] = useState("")
  return <MediaTagEditor
    items={items}
    selectedIds={selectedIds}
    bulkTag={bulkTag}
    onSelectedIdsChange={setSelectedIds}
    onBulkTagChange={setBulkTag}
    onBulkTagAction={(action) => {
      const tag = bulkTag.trim()
      if (!tag) return
      setItems((current) => current.map((item) => {
        if (!selectedIds.includes(item.id)) return item
        if (action === "replace") return { ...item, tags: [tag] }
        if (action === "remove") return { ...item, tags: item.tags.filter((value) => value !== tag) }
        return { ...item, tags: item.tags.includes(tag) ? item.tags : [...item.tags, tag] }
      }))
      setBulkTag("")
    }}
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
