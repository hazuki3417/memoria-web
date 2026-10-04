import type { Meta, StoryObj } from "@storybook/react"
import { MediaTagEditorList } from "./MediaTagEditorList"
import { MediaTagEditorRow } from "./MediaTagEditorRow"

const meta = {
  title: "Components/Media Tag Editor/List",
  component: MediaTagEditorList,
} satisfies Meta<typeof MediaTagEditorList>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  render: () => (
    <MediaTagEditorList>
      {[
        <MediaTagEditorRow
          key="1"
          label="IMG_1842.HEIC"
          detail="8.4 MB"
          tags={["旅行"]}
          selected
          onSelect={() => undefined}
          onTagsChange={() => undefined}
        />,
        <MediaTagEditorRow
          key="2"
          label="IMG_1843.HEIC"
          detail="7.9 MB"
          tags={[]}
          selected
          onSelect={() => undefined}
          onTagsChange={() => undefined}
        />,
      ]}
    </MediaTagEditorList>
  ),
}
