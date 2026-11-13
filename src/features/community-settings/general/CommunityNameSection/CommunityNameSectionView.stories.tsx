import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { CommunityNameSectionView } from "./CommunityNameSectionView"
import { useCommunityNameForm } from "./useCommunityNameForm"
import type { SaveCommunityName } from "./communityNameSaveOutcome"

type ViewFixtureProps = {
  isAdmin: boolean
  initialName: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  outcome?: "success" | "unknown" | "validation" | "retryable"
  inspectionAvailable?: boolean
}

/** Viewに必要なForm ModelだけをStoryから注入し、実際の表示責務を検証する。 */
const CommunityNameSectionViewFixture = ({
  isAdmin,
  initialName,
  initialSaveState,
  outcome = "success",
  inspectionAvailable = false,
}: ViewFixtureProps) => {
  const onSave: SaveCommunityName = async (name) => {
    if (outcome === "unknown") return { kind: "unknown" }
    if (outcome === "retryable") return { kind: "rejected", reason: { kind: "retryable" } }
    if (outcome === "validation") {
      return {
        kind: "rejected",
        reason: {
          kind: "validation",
          violations: [{ scope: "FORM", code: "INVALID_COMBINATION", inputPaths: [] }],
        },
      }
    }
    return { kind: "success", value: name }
  }
  const onInspectName = inspectionAvailable ? async () => "サーバーに残るCommunity名" : undefined
  const form = useCommunityNameForm({
    initialName,
    initialSaveState,
    onSave,
    onInspect: onInspectName,
  })
  return <CommunityNameSectionView form={form} isAdmin={isAdmin} onInspectName={onInspectName} />
}

const meta = {
  title: "features/community-settings/general/CommunityNameSectionView",
  component: CommunityNameSectionViewFixture,
  args: {
    isAdmin: true,
    initialName: "家族のアルバム",
    initialSaveState: "idle",
    outcome: "success",
    inspectionAvailable: false,
  },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunityNameSectionViewFixture>
export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  name: "Visual · Community名の初期表示",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("基本情報")).toBeVisible()
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue("家族のアルバム")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const ReadOnly: Story = {
  name: "Visual · 一般Memberの閲覧専用状態",
  tags: ["visual"],
  args: { isAdmin: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toBeDisabled()
    await expect(canvas.queryByRole("button", { name: "保存" })).not.toBeInTheDocument()
  },
}

export const Saving: Story = {
  name: "Visual · 保存中の入力停止",
  tags: ["visual"],
  args: { initialSaveState: "saving" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const Blocked: Story = {
  name: "Visual · 保存不可の状態",
  tags: ["visual"],
  args: { initialSaveState: "blocked" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toBeDisabled()
  },
}

export const Unknown: Story = {
  name: "Visual · 保存結果不明の照会操作",
  tags: ["visual"],
  args: { outcome: "unknown", inspectionAvailable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "現在の状態を確認" })).toBeVisible()
    await expect(input).toHaveValue("未確定のCommunity名")
  },
}

export const FormValidation: Story = {
  name: "Visual · Form ValidationのFeedback",
  tags: ["visual"],
  args: { outcome: "validation" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更したCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("入力内容を確認してください")
    await userEvent.type(input, "を再編集")
    await expect(input).toHaveValue("変更したCommunity名を再編集")
    await expect(canvas.getByRole("alert")).toBeVisible()
  },
}
