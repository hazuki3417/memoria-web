import type { Meta, StoryObj } from "@storybook/react"
import { PageHeader } from "./PageHeader"
import { SaveStatus } from "../SaveStatus"

const meta = {
  title: "Components/Page Header",
  component: PageHeader,
  args: {
    title: "プロフィール",
    description: "プロフィール情報を変更します。",
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],
}

export const WithTitleAccessoryStatus: Story = {
  name: "Visual · タイトル横の保存バッジ",
  tags: ["visual"],
  args: {
    title: "環境設定",
    description: "表示とプレビューの動作を設定します。",
    titleAccessory: <SaveStatus state="saving" />,
  },
}

export const WithIdleTitleAccessoryStatus: Story = {
  name: "Visual · 状態非表示時も配置を予約",
  tags: ["visual"],
  args: {
    title: "環境設定",
    description: "表示とプレビューの動作を設定します。",
    titleAccessory: <SaveStatus state="idle" />,
  },
}
