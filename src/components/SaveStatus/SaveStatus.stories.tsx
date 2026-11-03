import { Box, Button, Stack, Text } from "@mantine/core"
import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { FeedbackAlert } from "../Feedback"
import { PageHeader } from "../PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING } from "./SaveStatus"

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
        timing={SETTINGS_SAVE_STATUS_TIMING}
        announce
      />
      <Button onClick={() => setState("saving")}>Start saving</Button>
      <Button onClick={() => setState("saved")}>Confirm saved</Button>
      <Button onClick={() => setState("attention")}>Require attention</Button>
    </Stack>
  )
}

export const TimedPresentationCandidate: Story = {
  name: "Interaction · 合意済みTiming（Saving 300ms / Saved 2秒）",
  render: () => <TimedPresentationScenario />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const announcement = canvas.getByRole("status")
    await userEvent.click(canvas.getByRole("button", { name: "Start saving" }))
    // The queue may complete before 300ms; the transient badge must not flash.
    expect(canvas.queryByText("保存中")).not.toBeInTheDocument()
    await waitFor(() => expect(canvas.getByText("保存中")).toBeVisible(), {
      timeout: 1500,
    })
    expect(announcement).toBeEmptyDOMElement()
    await userEvent.click(canvas.getByRole("button", { name: "Confirm saved" }))
    await expect(canvas.getByText("保存済み")).toBeVisible()
    await expect(announcement).toHaveTextContent("変更を保存しました")
    await waitFor(() => expect(canvas.getByText("保存済み")).not.toBeVisible(), {
      timeout: 3000,
    })
    await expect(announcement).toBeEmptyDOMElement()
  },
}

export const TimedSavingAnnouncement: Story = {
  name: "Interaction · 2秒を超えるSavingのみ読み上げる",
  render: () => <TimedPresentationScenario />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const announcement = canvas.getByRole("status")
    await userEvent.click(canvas.getByRole("button", { name: "Start saving" }))
    expect(announcement).toBeEmptyDOMElement()
    await waitFor(() => expect(announcement).toHaveTextContent("保存中です"), {
      timeout: 3000,
    })
    await userEvent.click(canvas.getByRole("button", { name: "Confirm saved" }))
    await expect(announcement).toHaveTextContent("変更を保存しました")
  },
}

export const TimedInterruptions: Story = {
  name: "Interaction · 高速保存とError遷移でTimerをCancel",
  render: () => <TimedPresentationScenario />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const announcement = canvas.getByRole("status")
    await userEvent.click(canvas.getByRole("button", { name: "Start saving" }))
    await userEvent.click(canvas.getByRole("button", { name: "Confirm saved" }))
    expect(canvas.queryByText("保存中")).not.toBeInTheDocument()
    await expect(canvas.getByText("保存済み")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "Start saving" }))
    await expect(canvas.getByText("保存済み")).not.toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "Require attention" }))
    await expect(canvas.getByText("要確認")).toBeVisible()
    await expect(announcement).toBeEmptyDOMElement()
    // Old Saving/Saved timers cannot clear a persistent error.
    await new Promise((resolve) => setTimeout(resolve, 2100))
    await expect(canvas.getByText("要確認")).toBeVisible()
    await expect(announcement).toBeEmptyDOMElement()
  },
}
