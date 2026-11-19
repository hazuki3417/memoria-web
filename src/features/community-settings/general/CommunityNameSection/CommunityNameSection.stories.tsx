import { Box, Button } from "@mantine/core"
import { useRef, useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { CommunityNameSection } from "./CommunityNameSection"
import type { SaveCommunityName, CommunityNameSaveRejection } from "./communityNameSaveOutcome"

type CommunityNameOutcome = Awaited<ReturnType<SaveCommunityName>>
const saveSuccess = (name: string): CommunityNameOutcome => ({ kind: "success", value: name })
const saveUnknown = (): CommunityNameOutcome => ({ kind: "unknown" })
const saveValidation = (
  violations: Extract<CommunityNameSaveRejection, { kind: "validation" }>["violations"],
): CommunityNameOutcome => ({ kind: "rejected", reason: { kind: "validation", violations } })
const saveBlocked = (error: unknown): CommunityNameOutcome => ({
  kind: "rejected", reason: { kind: "blocked", error },
})
const saveRetryable = (): CommunityNameOutcome => ({
  kind: "rejected", reason: { kind: "retryable" },
})

const meta = {
  title: "features/community-settings/general/CommunityNameSection",
  component: CommunityNameSection,
  args: {
    communityName: "家族のアルバム",
    isAdmin: true,
  },
  decorators: [
    (Story) => (
      <Box maw={760} p="md">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunityNameSection>
export default meta
type Story = StoryObj<typeof meta>

/** CommunityNameSection states are verified through the actual General page. */
export const NameEdited: Story = {
  name: "Interaction · Community名編集中",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(canvas.getByRole("textbox", { name: /Community名/ }))
    await userEvent.type(
      canvas.getByRole("textbox", { name: /Community名/ }),
      "新しいCommunity名",
    )
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()
  },
}

export const NameInvalid: Story = {
  name: "Interaction · Community名未入力",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(canvas.getByRole("textbox", { name: /Community名/ }))
    await expect(canvas.queryByText("Community名を入力してください")).not.toBeInTheDocument()
    await userEvent.tab()
    await expect(
      canvas.getByText("Community名を入力してください"),
    ).toBeVisible()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await userEvent.type(canvas.getByRole("textbox", { name: /Community名/ }), "修正済み")
    await expect(canvas.queryByText("Community名を入力してください")).not.toBeInTheDocument()
    await userEvent.clear(canvas.getByRole("textbox", { name: /Community名/ }))
    await expect(canvas.getByText("Community名を入力してください")).toBeVisible()
  },
}

export const NameSaving: Story = {
  name: "Interaction · Community名保存中",
  tags: ["interaction"],
  args: { onSaveName: fn(() => new Promise<CommunityNameOutcome>(() => undefined)) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "新しいCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSaveName).toHaveBeenCalledWith("新しいCommunity名")
    await expect(input).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameServerFieldValidation: Story = {
  name: "Interaction · Community名のServer Field Error",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => {
      return saveValidation([
        { scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["name"] }] },
      ])
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("文字数が上限を超えています。")).toBeVisible()
    await expect(input).toHaveValue("変更後のCommunity名")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const NameServerFormValidation: Story = {
  name: "Interaction · Community名のForm Error",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => {
      return saveValidation([
        { scope: "FORM", code: "INVALID_COMBINATION", inputPaths: [] },
      ])
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(input).toHaveValue("変更後のCommunity名")
  },
}

export const NameUnknownOutcome: Story = {
  name: "Interaction · Community名の保存結果不明は再送しない",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => { return saveUnknown() }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("Community名の保存結果を確認できませんでした")).toBeVisible()
    await expect(input).toHaveValue("変更後のCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
  },
}

export const NameTrimmedUnchanged: Story = {
  name: "Interaction · 前後の空白のみの変更は保存不可",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, " 家族のアルバム ")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

/** Simulate a new query result without remounting the RHF form. */
function CommunityNameRefreshFixture(
  args: ComponentProps<typeof CommunityNameSection>,
) {
  const [name, setName] = useState(args.communityName ?? "家族のアルバム")
  return (
    <>
      <Button onClick={() => setName("サーバー更新後のCommunity名")}>
        サーバー再取得を再現
      </Button>
      <CommunityNameSection {...args} communityName={name} />
    </>
  )
}

export const NameRefreshWhileUntouched: Story = {
  name: "Interaction · 表示後の取得値を自動反映しない",
  tags: ["interaction"],
  render: (args) => <CommunityNameRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole("button", { name: "サーバー再取得を再現" }),
    )
    await expect(
      canvas.getByRole("textbox", { name: /Community名/ }),
    ).toHaveValue("家族のアルバム")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameRefreshArrivesWhileEditingThenReverted: Story = {
  name: "Interaction · 編集を戻しても取得値を自動採用しない",
  tags: ["interaction"],
  render: (args) => <CommunityNameRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    const save = canvas.getByRole("button", { name: "保存" })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のDraft")
    await userEvent.click(canvas.getByRole("button", { name: "サーバー再取得を再現" }))
    await expect(input).toHaveValue("編集中のDraft")
    await userEvent.clear(input)
    await userEvent.type(input, "家族のアルバム")
    await expect(input).toHaveValue("家族のアルバム")
    await expect(save).toBeDisabled()
  },
}

export const NameRefreshWhileEditing: Story = {
  name: "Interaction · 編集中のDraftをServer更新から保護",
  tags: ["interaction"],
  render: (args) => <CommunityNameRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のCommunity名")
    await userEvent.click(
      canvas.getByRole("button", { name: "サーバー再取得を再現" }),
    )
    await expect(input).toHaveValue("編集中のCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()
  },
}

/** Complete a pending save after the user has made a second edit. */
function CommunityNamePendingSaveFixture(
  args: ComponentProps<typeof CommunityNameSection>,
) {
  const resolveSave = useRef<((outcome: CommunityNameOutcome) => void) | null>(null)
  return (
    <>
      <Button onClick={() => resolveSave.current?.(saveSuccess("最初の変更"))}>
        保存応答を再現
      </Button>
      <CommunityNameSection
        {...args}
        onSaveName={() =>
          new Promise<CommunityNameOutcome>((resolve) => {
            resolveSave.current = resolve
          })
        }
      />
    </>
  )
}

export const NameEditedDuringSave: Story = {
  name: "Interaction · 保存中は入力を停止し、確定後もDraftを維持",
  tags: ["interaction"],
  render: (args) => <CommunityNamePendingSaveFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "最初の変更")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(input).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await userEvent.click(canvas.getByRole("button", { name: "保存応答を再現" }))
    await waitFor(() => expect(input).toBeEnabled())
    await expect(input).toHaveValue("最初の変更")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameNormalizedSave: Story = {
  name: "Interaction · Community名の空白を正規化して保存",
  tags: ["interaction"],
  args: { onSaveName: fn(async (name: string) => saveSuccess(name)) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "  正規化したCommunity名  ")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSaveName).toHaveBeenCalledWith("正規化したCommunity名")
    await expect(input).toHaveValue("正規化したCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameSaveStaleQuery: Story = {
  name: "Interaction · 保存確定後に古いQueryが返っても確定値を維持",
  tags: ["interaction"],
  args: { onSaveName: fn(async (name: string) => saveSuccess(name)) },
  render: (args) => <CommunityNameRefreshFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "確定したCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSaveName).toHaveBeenCalledWith("確定したCommunity名")
    await expect(input).toHaveValue("確定したCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "サーバー再取得を再現" }))
    await expect(input).toHaveValue("確定したCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameRetryable: Story = {
  name: "Interaction · 保存失敗後は通常の保存操作で再保存",
  tags: ["interaction"],
  args: {
    onSaveName: fn()
      .mockResolvedValueOnce(saveRetryable())
      .mockImplementation((name: string) => Promise.resolve(saveSuccess(name))),
  },
  play: async ({ canvasElement, args }) => {
    args.onSaveName?.mockReset()
    args.onSaveName?.mockResolvedValueOnce(saveRetryable())
    args.onSaveName?.mockImplementation((name: string) => Promise.resolve(saveSuccess(name)))
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "再試行する名前")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Community名を保存できませんでした")
    await expect(input).toHaveValue("再試行する名前")
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSaveName).toHaveBeenCalledTimes(2)
    await waitFor(() => expect(canvas.queryByRole("alert")).not.toBeInTheDocument())
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameBlockedForbidden: Story = {
  name: "Interaction · Community名を変更できない権限状態",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => {
      return saveBlocked({ graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] })
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("この操作を行う権限がありません")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

