import { Badge } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { MediaTagEditorRow } from "./MediaTagEditorRow"

const meta = {
  title: "Components/Media Tag Editor/Row",
  component: MediaTagEditorRow,
  args: {
    label: "IMG_1842.HEIC",
    detail: "8.4 MB",
    tags: ["旅行"],
    selected: true,
    supplementary: (
      <Badge variant="light" color="gray">
        準備完了
      </Badge>
    ),
    onSelect: () => undefined,
    onTagsChange: () => undefined,
  },
} satisfies Meta<typeof MediaTagEditorRow>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
