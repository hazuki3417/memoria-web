import type { Meta, StoryObj } from "@storybook/react"
import { PageHeader } from "./PageHeader"

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

export const Default: Story = {}
