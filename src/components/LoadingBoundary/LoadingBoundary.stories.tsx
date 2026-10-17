import type { Meta, StoryObj } from "@storybook/react"
import { Text } from "@mantine/core"
import { LoadingBoundary } from "./LoadingBoundary"

const meta = {
  title: "Components/Loading Boundary",
  component: LoadingBoundary,
  args: {
    loading: true,
    delayMs: 0,
    label: "Community情報を読み込み中",
    children: <Text>取得済みのコンテンツ</Text>,
  },
} satisfies Meta<typeof LoadingBoundary>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {}

export const Ready: Story = {
  args: { loading: false },
}
