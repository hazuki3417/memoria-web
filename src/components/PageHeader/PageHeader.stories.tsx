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

export const WithTrailingStatus: Story = {
  name: "Visual · タイトル右側の状態表示",
  tags: ["visual"],
  args: {
    title: "環境設定",
    description: "表示とプレビューの動作を設定します。",
    trailing: <SaveStatus state="saving" />,
  },
}

export const WithIdleTrailingStatus: Story = {
  name: "Visual · 状態非表示時も配置を予約",
  tags: ["visual"],
  args: {
    title: "環境設定",
    description: "表示とプレビューの動作を設定します。",
    trailing: <SaveStatus state="idle" />,
  },
}
