import type { Meta, StoryObj } from "@storybook/react"
import { ImageDetailInfoPanel } from "./ImageDetailInfoPanel"

const values = {
  groups: ["旅行", "お気に入り"],
  tags: ["風景", "自然"],
  communities: ["Photo Club"],
}
const expanded = { groups: false, tags: false, communities: false }

const meta = {
  title: "Features/Image Detail/ImageDetailInfoPanel",
  component: ImageDetailInfoPanel,
  args: {
    compact: false,
    detailInfoOpened: true,
    detailValues: values,
    detailSectionsExpanded: expanded,
    toggleDetailSection: () => undefined,
    openDetailEditor: () => undefined,
    setUnshareTarget: () => undefined,
    setShareTarget: () => undefined,
    setDetailEditor: () => undefined,
    context: "personal",
    downloadMock: "available",
  },
} satisfies Meta<typeof ImageDetailInfoPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {}
export const Community: Story = { args: { context: "community" } }
export const Compact: Story = { args: { compact: true } }
export const ForbiddenDownload: Story = { args: { downloadMock: "forbidden" } }
