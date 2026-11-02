import { Box, Button, Stack, Text } from "@mantine/core"
import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { FeedbackAlert } from "../Feedback"
import { PageHeader } from "../PageHeader"
import { SaveStatus } from "./SaveStatus"

const meta = {
  title: "Components/Save Status",
  component: SaveStatus,
  args: { state: "saving" },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
  render: (args) => (
    <PageHeader
      title="環境設定"
      description="表示とプレビューの動作を設定します。"
      titleAccessory={<SaveStatus {...args} />}
    />
  ),
} satisfies Meta<typeof SaveStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Saving: Story = {
  name: "Visual · 保存中",
  tags: ["visual"],
}

export const Pending: Story = {
  name: "Visual · 保存待ち",
  tags: ["visual"],
  args: { state: "pending" },
}

export const Saved: Story = {
  name: "Visual · 保存済み",
  tags: ["visual"],
  args: { state: "saved" },
}

export const Attention: Story = {
  name: "Visual · 要確認",
  tags: ["visual"],
  args: { state: "attention" },
}

export const Idle: Story = {
  name: "Visual · 非表示でもレイアウト保持",
  tags: ["visual"],
  args: { state: "idle" },
}

export const WithErrorDetails: Story = {
  name: "Visual · タイトル横バッジと詳細Errorを分離",
  tags: ["visual"],
  args: { state: "attention" },
  render: (args) => (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="表示とプレビューの動作を設定します。"
        titleAccessory={<SaveStatus {...args} />}
      />
      <FeedbackAlert kind="error" title="保存結果を確認できませんでした">
        <Text size="sm">
          変更内容は保持されています。現在の設定を確認してから、必要に応じて再保存してください。
        </Text>
      </FeedbackAlert>
    </Stack>
  ),
}

function AnnouncementScenario() {
  const [state, setState] = useState<
    "idle" | "pending" | "saving" | "saved" | "attention"
  >("idle")

  return (
    <Stack align="flex-start">
      <SaveStatus state={state} announce />
      <Button onClick={() => setState("pending")}>Pending</Button>
      <Button onClick={() => setState("saving")}>Saving</Button>
      <Button onClick={() => setState("saved")}>Saved</Button>
      <Button onClick={() => setState("attention")}>Attention</Button>
    </Stack>
  )
}

export const AnnouncementTransitions: Story = {
  name: "Interaction · 保存確定のみ読み上げる",
  render: () => <AnnouncementScenario />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const status = canvas.getByRole("status")
    expect(status).toBeEmptyDOMElement()

    await userEvent.click(canvas.getByRole("button", { name: "Pending" }))
    expect(status).toBeEmptyDOMElement()
    await userEvent.click(canvas.getByRole("button", { name: "Saving" }))
    expect(status).toBeEmptyDOMElement()
    await userEvent.click(canvas.getByRole("button", { name: "Saved" }))
    await expect(status).toHaveTextContent("変更を保存しました")
    await userEvent.click(canvas.getByRole("button", { name: "Attention" }))
    await expect(status).toBeEmptyDOMElement()
  },
}

function TimedPresentationScenario() {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "attention">(
    "idle",
  )
  return (
    <Stack align="flex-start">
      <SaveStatus
        state={state}
        timing={{
          savingDelayMs: 300,
          savedDurationMs: 2000,
          savingAnnouncementMs: 2000,
        }}
        announce
      />
      <Button onClick={() => setState("saving")}>Start saving</Button>
      <Button onClick={() => setState("saved")}>Confirm saved</Button>
      <Button onClick={() => setState("attention")}>Require attention</Button>
    </Stack>
  )
}

export const TimedPresentationCandidate: Story = {
  name: "Interaction · Timing候補（実画面未適用）",
  render: () => <TimedPresentationScenario />,
}
