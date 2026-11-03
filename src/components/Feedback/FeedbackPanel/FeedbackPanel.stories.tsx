import { Box, Button } from "@mantine/core"
import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { FeedbackPanel } from "./FeedbackPanel"

const meta = {
  title: "Components/Feedback Panel",
  component: FeedbackPanel,
  args: {
    kind: "info",
    title: "現在の状態を確認しています",
    children: "表示中の内容は保持されます。",
  },
  decorators: [
    (Story) => (
      <Box maw={560}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FeedbackPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Information: Story = {
  name: "Visual · 継続参照する情報",
  tags: ["visual"],
}

export const FormError: Story = {
  name: "Visual · 入力の修正が必要",
  tags: ["visual"],
  args: {
    kind: "error",
    title: "入力内容を確認してください",
    children:
      "入力した値を受け付けられませんでした。内容を確認してから、もう一度保存してください。",
    role: "alert",
  },
}

export const UnknownOutcome: Story = {
  name: "Visual · 保存結果の確認が必要",
  tags: ["visual"],
  args: {
    kind: "warning",
    title: "プロフィールの保存結果を確認できませんでした",
    children:
      "入力した内容は保持しています。前の保存が成功したか分からないため、現在の状態を確認してください。",
    role: "alert",
    actions: (
      <Button size="xs" variant="light">
        現在の状態を確認
      </Button>
    ),
  },
}

export const LongContent: Story = {
  name: "Visual · 狭い幅と長文でも操作を表示",
  tags: ["visual"],
  render: () => (
    <Box maw={320}>
      <FeedbackPanel
        kind="error"
        title="現在の状態ではプロフィール情報の変更を続けられません"
        role="alert"
        actions={
          <>
            <Button size="xs" variant="light">
              現在のプロフィール情報を確認
            </Button>
            <Button size="xs" variant="subtle" color="gray">
              入力内容を破棄して戻る
            </Button>
          </>
        }
      >
        保存しようとした値とサーバー上の現在値が異なります。これまでの入力を失わないよう、
        内容を確認してから次の操作を選んでください。
      </FeedbackPanel>
    </Box>
  ),
}

function RecoveryFixture() {
  const [checked, setChecked] = useState(false)
  return checked ? (
    <Box role="status">現在の状態を確認しました</Box>
  ) : (
    <FeedbackPanel
      kind="warning"
      title="保存結果を確認できませんでした"
      role="alert"
      actions={
        <Button size="xs" onClick={() => setChecked(true)}>
          現在の状態を確認
        </Button>
      }
    >
      結果の確認が必要です。背景の入力操作を遮りません。
    </FeedbackPanel>
  )
}

export const RecoveryInteraction: Story = {
  name: "Interaction · Panel内の復旧Actionを操作",
  tags: ["interaction"],
  render: () => <RecoveryFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "現在の状態を確認しました",
    )
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}


export const Confirmed: Story = {
  name: "Visual · 確認済みの結果",
  tags: ["visual"],
  args: {
    kind: "success",
    title: "現在の状態を確認しました",
    children: "操作結果が確定しました。継続して参照する必要がある情報を表示します。",
    role: "status",
  },
}

export const RecoverableFailure: Story = {
  name: "Visual · 失敗と明示的な再試行",
  tags: ["visual"],
  args: {
    kind: "error",
    title: "保存できませんでした",
    children: "入力内容を保持しています。必要な修正を行い、もう一度保存してください。",
    role: "alert",
    actions: (
      <>
        <Button size="xs">もう一度保存</Button>
        <Button size="xs" variant="subtle" color="gray">変更を破棄</Button>
      </>
    ),
  },
}
