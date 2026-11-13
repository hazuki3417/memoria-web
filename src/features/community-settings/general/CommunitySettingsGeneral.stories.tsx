import { Box, Button } from "@mantine/core"
import { useRef, useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { CommunitySettingsStoryNavigation } from "../storybook/CommunitySettingsStoryNavigation"
import type { SaveCommunityName, CommunityNameSaveRejection } from "./CommunityNameSection/communityNameSaveOutcome"

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
  title: "Features/Community Settings/Settings",
  component: CommunitySettingsStoryNavigation,
  render: (args) => <CommunitySettingsStoryNavigation {...args} />,
  args: {
    onSectionChange: () => undefined,
    invitationMode: "preview",
    communityId: "photo-club",
    communityName: "家族のアルバム",
    role: "admin",
    section: "general",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "member" },
    ],
  },
  decorators: [
    (Story) => (
      <Box h={600}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunitySettingsStoryNavigation>
export default meta
type Story = StoryObj<typeof meta>

export const General: Story = {
  name: "Visual · 一般",
  tags: ["visual"],
}

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

export const NameReadOnly: Story = {
  name: "Visual · Community名閲覧のみ",
  tags: ["visual"],
  args: { role: "member" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("textbox", { name: /Community名/ }),
    ).toBeDisabled()
    await expect(
      canvas.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument()
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
  args: ComponentProps<typeof CommunitySettingsStoryNavigation>,
) {
  const [name, setName] = useState(args.communityName ?? "家族のアルバム")
  return (
    <>
      <Button onClick={() => setName("サーバー更新後のCommunity名")}>
        サーバー再取得を再現
      </Button>
      <CommunitySettingsStoryNavigation {...args} communityName={name} />
    </>
  )
}

export const NameRefreshWhileUntouched: Story = {
  name: "Interaction · 未編集ならServer更新を反映",
  tags: ["interaction"],
  render: (args) => <CommunityNameRefreshFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole("button", { name: "サーバー再取得を再現" }),
    )
    await expect(
      canvas.getByRole("textbox", { name: /Community名/ }),
    ).toHaveValue("サーバー更新後のCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
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
  args: ComponentProps<typeof CommunitySettingsStoryNavigation>,
) {
  const resolveSave = useRef<((outcome: CommunityNameOutcome) => void) | null>(null)
  return (
    <>
      <Button onClick={() => resolveSave.current?.(saveSuccess("最初の変更"))}>
        保存応答を再現
      </Button>
      <CommunitySettingsStoryNavigation
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

export const NameUnknownMatches: Story = {
  name: "Interaction · Community名は現在値一致を明示確認する",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => { return saveUnknown() }),
    onInspectName: fn(async () => "変更するCommunity名"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更するCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "確認完了" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("保存結果は不明です")
    await userEvent.click(canvas.getByRole("button", { name: "確認完了" }))
    await expect(input).toHaveValue("変更するCommunity名")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
  },
}

export const NameUnknownDiffers: Story = {
  name: "Visual · Community名の現在値とDraftが不一致",
  tags: ["visual"],
  args: {
    onSaveName: fn(async () => { return saveUnknown() }),
    onInspectName: fn(async () => "現在のCommunity名"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "もう一度保存" })).toBeEnabled()
    await expect(canvas.getByRole("button", { name: "変更を破棄" })).toBeVisible()
    await expect(canvas.getByRole("alert")).toHaveTextContent("保存結果は不明です")
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
  },
}

export const NameUnknownInspectFailure: Story = {
  name: "Interaction · Community名照会失敗時は再送しない",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => { return saveUnknown() }),
    onInspectName: fn(async () => { throw new Error("read failed") }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "保存結果は不明です",
    )
    await expect(canvas.queryByRole("button", { name: "もう一度保存" })).not.toBeInTheDocument()
    await expect(input).toHaveValue("未確定のCommunity名")
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
  },
}

/** Inspectionの応答より後に入力されたDraftを、古い観測値から保護する。 */
const CommunityNamePendingInspectionFixture = (
  args: ComponentProps<typeof CommunitySettingsStoryNavigation>,
) => {
  const resolveInspection = useRef<((name: string) => void) | null>(null)
  return (
    <>
      <Button onClick={() => resolveInspection.current?.("古い観測値")}>
        遅延照会を返す
      </Button>
      <CommunitySettingsStoryNavigation
        {...args}
        onSaveName={async () => saveUnknown()}
        onInspectName={() =>
          new Promise<string>((resolve) => {
            resolveInspection.current = resolve
          })
        }
      />
    </>
  )
}

export const NameUnknownStaleInspection: Story = {
  name: "Interaction · 照会中の追加編集は古い観測値から保護",
  tags: ["interaction"],
  render: (args) => <CommunityNamePendingInspectionFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "初回Draft")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await userEvent.type(input, "と追加編集")
    await userEvent.click(canvas.getByRole("button", { name: "遅延照会を返す" }))
    await expect(input).toHaveValue("初回Draftと追加編集")
    await expect(canvas.queryByRole("button", { name: "確認完了" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "もう一度保存" })).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "現在の状態を確認" })).toBeVisible()
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

export const NameUnknownExplicitRetry: Story = {
  name: "Interaction · 状態照会後の明示再保存は1回だけ実行",
  tags: ["interaction"],
  args: {
    onSaveName: fn()
      .mockResolvedValueOnce(saveUnknown())
      .mockImplementation((name: string) => Promise.resolve(saveSuccess(name))),
    onInspectName: fn(async () => "以前のCommunity名"),
  },
  play: async ({ canvasElement, args }) => {
    args.onSaveName?.mockReset()
    args.onSaveName?.mockResolvedValueOnce(saveUnknown())
    args.onSaveName?.mockImplementation((name: string) => Promise.resolve(saveSuccess(name)))
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "明示的に再保存する名前")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "もう一度保存" })).toBeEnabled()
    await userEvent.click(canvas.getByRole("button", { name: "もう一度保存" }))
    await expect(args.onSaveName).toHaveBeenCalledTimes(2)
    await expect(args.onSaveName).toHaveBeenLastCalledWith("明示的に再保存する名前")
    await waitFor(() => expect(canvas.queryByRole("alert")).not.toBeInTheDocument())
    await expect(input).toHaveValue("明示的に再保存する名前")
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
  name: "Interaction · 再試行可能な失敗ではDraftを保持して明示再保存",
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
    await expect(await canvas.findByRole("alert")).toHaveTextContent("再試行してください")
    await expect(input).toHaveValue("再試行する名前")
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(args.onSaveName).toHaveBeenCalledTimes(2)
    await waitFor(() => expect(canvas.queryByRole("alert")).not.toBeInTheDocument())
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameUnknownDiscard: Story = {
  name: "Interaction · Community名の現在値へ明示破棄",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => { return saveUnknown() }),
    onInspectName: fn(async () => "確認した現在値"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "現在の状態を確認" }))
    await expect(await canvas.findByRole("button", { name: "変更を破棄" })).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "変更を破棄" }))
    await expect(input).toHaveValue("確認した現在値")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
  },
}

export const NameBlockedForbidden: Story = {
  name: "Visual · Community名を変更できない権限状態",
  tags: ["visual"],
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

export const NameFormValidationVisual: Story = {
  name: "Visual · Community名のForm Validation Feedback",
  tags: ["visual"],
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
    await userEvent.type(input, "を再編集")
    await expect(canvas.getByRole("alert")).toBeVisible()
  },
}

/** Mirrors the production key={communityId} remount boundary without a Router mock. */
function CommunitySwitchFixture(args: ComponentProps<typeof CommunitySettingsStoryNavigation>) {
  const [communityId, setCommunityId] = useState("photo-club")
  const communityName =
    communityId === "photo-club" ? "家族のアルバム" : "旅行の思い出"
  return (
    <>
      <Button
        onClick={() =>
          setCommunityId((id) =>
            id === "photo-club" ? "travel-club" : "photo-club",
          )
        }
      >
        Communityを切り替える
      </Button>
      <CommunitySettingsStoryNavigation
        {...args}
        key={communityId}
        communityId={communityId}
        communityName={communityName}
      />
    </>
  )
}

/** Context changes must not reuse the previous Community's RHF draft. */
export const NameContextChangeReset: Story = {
  name: "Interaction · Community切替で編集Draftを初期化",
  tags: ["interaction"],
  render: (args) => <CommunitySwitchFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のCommunity名")
    await expect(input).toHaveValue("編集中のCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue(
      "旅行の思い出",
    )
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue(
      "家族のアルバム",
    )
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

/** Preview invitation state must not cross the production Community key boundary. */
export const InvitationContextChangeReset: Story = {
  name: "Interaction · Community切替でInvitation状態を初期化",
  tags: ["interaction"],
  render: (args) => <CommunitySwitchFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("未発行")).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "招待URLを発行" }))
    await expect(canvas.getByText("有効")).toBeVisible()

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByText("未発行")).toBeVisible()
    await expect(canvas.getByRole("textbox", { name: "招待URL" })).toHaveValue("-")

    await userEvent.click(
      canvas.getByRole("button", { name: "Communityを切り替える" }),
    )
    await expect(canvas.getByText("未発行")).toBeVisible()
  },
}


/** Switching from Administrator to Member must immediately hide an issued preview secret. */
function InvitationRoleChangeFixture(args: ComponentProps<typeof CommunitySettingsStoryNavigation>) {
  const [role, setRole] = useState<"admin" | "member">("admin")
  return (
    <>
      <Button onClick={() => setRole((current) => current === "admin" ? "member" : "admin")}>
        Roleを切り替える
      </Button>
      <CommunitySettingsStoryNavigation {...args} role={role} />
    </>
  )
}

export const InvitationRoleChangeSecretProtection: Story = {
  name: "Interaction · Memberへの変更でInvitation URLを非表示",
  tags: ["interaction"],
  render: (args) => <InvitationRoleChangeFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "招待URLを発行" }))
    await expect(canvas.getByRole("textbox", { name: "招待URL" })).toHaveValue(
      "https://example.com/invitations/photo-club-demo-1",
    )

    await userEvent.click(canvas.getByRole("button", { name: "Roleを切り替える" }))
    await expect(canvas.getByText("招待URLの発行と管理はAdministratorのみ行えます。")).toBeVisible()
    await expect(canvas.queryByRole("textbox", { name: "招待URL" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLをコピー" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "再発行" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "無効化" })).not.toBeInTheDocument()
  },
}

export const InvitationProductionUnavailable: Story = {
  name: "Interaction · 本番では仮Invitationを発行しない",
  tags: ["interaction"],
  args: { invitationMode: "unavailable" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("招待URLの管理機能は現在利用できません。")).toBeVisible()
    await expect(canvas.queryByRole("textbox", { name: "招待URL" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLを発行" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLをコピー" })).not.toBeInTheDocument()
  },
}

/** URL-controlled consumers do not opt into the Preview-only Invitation simulation by default. */
export const InvitationUrlControlledUnavailable: Story = {
  name: "Interaction · URL制御ではInvitationデモが既定で無効",
  tags: ["interaction"],
  args: { invitationMode: "unavailable" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("招待URLの管理機能は現在利用できません。")).toBeVisible()
    await expect(canvas.queryByRole("textbox", { name: "招待URL" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("button", { name: "招待URLを発行" })).not.toBeInTheDocument()
  },
}

/** Story IDは維持し、Generalを離れるとDraftが破棄される契約を検証する。 */
export const NameDraftSurvivesNavigation: Story = {
  name: "Interaction · Section切替でCommunity名のDraftを破棄",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "編集中のCommunity名")
    await expect(input).toHaveValue("編集中のCommunity名")

    const navigation = within(canvas.getByRole("navigation", { name: "Community設定" }))
    await userEvent.click(navigation.getByText("メンバー"))
    await expect(canvas.queryByRole("textbox", { name: /Community名/ })).not.toBeInTheDocument()
    await userEvent.click(navigation.getByText("一般"))
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue("家族のアルバム")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

/** 保存結果不明の表示もGeneral離脱で破棄し、戻った際はサーバー由来の値から開始する。 */
export const NameUnknownSurvivesNavigation: Story = {
  name: "Interaction · Section切替でCommunity名の未確定状態を破棄",
  tags: ["interaction"],
  args: { onSaveName: fn(async () => { return saveUnknown() }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "未確定のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("Community名の保存結果を確認できませんでした")).toBeVisible()

    const navigation = within(canvas.getByRole("navigation", { name: "Community設定" }))
    await userEvent.click(navigation.getByText("メンバー"))
    await userEvent.click(navigation.getByText("一般"))
    await expect(canvas.getByRole("textbox", { name: /Community名/ })).toHaveValue("家族のアルバム")
    await expect(canvas.queryByText("Community名の保存結果を確認できませんでした")).not.toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
    await expect(args.onSaveName).toHaveBeenCalledTimes(1)
  },
}
