import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { CommunityAliasSectionView } from "./CommunityAliasSectionView"
import { useCommunityAliasForm } from "./useCommunityAliasForm"
import type { SaveCommunityAlias } from "./communityAliasSaveOutcome"

type FixtureArgs = {
  savedAlias: string | null
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  result: "success" | "unknown" | "validation" | "retryable"
  inspectionAvailable: boolean
}

/** Viewの表示状態と操作を独立して検証するため、Form Modelを注入する。 */
const AliasViewFixture = ({
  savedAlias,
  initialSaveState,
  result,
  inspectionAvailable,
}: FixtureArgs) => {
  const onSave: SaveCommunityAlias = async (alias) => {
    if (result === "unknown") return { kind: "unknown" }
    if (result === "retryable") return { kind: "rejected", reason: { kind: "retryable" } }
    if (result === "validation") return {
      kind: "rejected",
      reason: {
        kind: "validation",
        violations: [{ scope: "FORM", code: "INVALID_COMBINATION", inputPaths: [] }],
      },
    }
    return { kind: "success", value: alias }
  }
  const onInspect = inspectionAvailable ? async (): Promise<string | null> => null : undefined
  const model = useCommunityAliasForm({ savedAlias, onSave, onInspect, initialSaveState })
  return <CommunityAliasSectionView model={model} onInspect={onInspect} />
}

const meta = {
  title: "features/community-settings/preferences/CommunityAliasSectionView",
  component: AliasViewFixture,
  args: {
    savedAlias: "元の別名",
    initialSaveState: "idle",
    result: "success",
    inspectionAvailable: false,
  },
  decorators: [(Story) => <Box maw={560} p="md"><Story /></Box>],
} satisfies Meta<typeof AliasViewFixture>
export default meta
type Story = StoryObj<typeof meta>

export const Initial: Story = {
  name: "Visual · Aliasの初期表示",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: "Community別名" })).toHaveValue("元の別名")
    await expect(canvas.getByText("自分だけに表示される名前です。空欄で保存すると正式名称が表示されます。")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NoAlias: Story = {
  name: "Visual · 別名未設定は空欄",
  tags: ["visual"],
  args: { savedAlias: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: "Community別名" })).toHaveValue("")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const Saving: Story = {
  name: "Visual · 保存中はAlias入力を停止",
  tags: ["visual"],
  args: { initialSaveState: "saving" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: "Community別名" })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const Blocked: Story = {
  name: "Visual · 保存不可でも既存どおりDraftは編集できる",
  tags: ["visual"],
  args: { initialSaveState: "blocked" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("textbox", { name: "Community別名" })).toBeEnabled()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const Unknown: Story = {
  name: "Visual · Aliasの結果不明時は照会操作を提供",
  tags: ["visual"],
  args: { result: "unknown", inspectionAvailable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "変更する別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "現在の状態を確認" })).toBeVisible()
    await expect(input).toHaveValue("変更する別名")
  },
}

export const FormValidation: Story = {
  name: "Visual · Form Validationは再編集後も案内を維持",
  tags: ["visual"],
  args: { result: "validation" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Community別名" })
    await userEvent.clear(input)
    await userEvent.type(input, "変更する別名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("入力内容を確認してください")
    await userEvent.type(input, "を再編集")
    await expect(canvas.getByRole("alert")).toBeVisible()
  },
}
