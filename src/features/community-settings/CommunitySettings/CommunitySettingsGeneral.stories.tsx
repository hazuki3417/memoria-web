import { Box, Button } from "@mantine/core"
import { useRef, useState, type ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
import { CommunitySettings } from "./CommunitySettings"
import { SettingsInputValidationError } from "@/features/settings/graphqlSettingsResult"

const meta = {
  title: "Features/Community Settings/Settings",
  component: CommunitySettings,
  args: {
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
} satisfies Meta<typeof CommunitySettings>
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
  },
}

export const NameSaving: Story = {
  name: "Interaction · Community名保存中",
  tags: ["interaction"],
  args: { onSaveName: fn(() => new Promise<string>(() => undefined)) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "新しいCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(args.onSaveName).toHaveBeenCalledWith("新しいCommunity名")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeDisabled()
  },
}

export const NameServerFieldValidation: Story = {
  name: "Interaction · Community名のServer Field Error",
  tags: ["interaction"],
  args: {
    onSaveName: fn(async () => {
      throw new SettingsInputValidationError([
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
      throw new SettingsInputValidationError([
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
    onSaveName: fn(async () => { throw new Error("timeout") }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "変更後のCommunity名")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await expect(await canvas.findByText("保存結果を確認できませんでした")).toBeVisible()
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
  args: ComponentProps<typeof CommunitySettings>,
) {
  const [name, setName] = useState(args.communityName ?? "家族のアルバム")
  return (
    <>
      <Button onClick={() => setName("サーバー更新後のCommunity名")}>
        サーバー再取得を再現
      </Button>
      <CommunitySettings {...args} communityName={name} />
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
  args: ComponentProps<typeof CommunitySettings>,
) {
  const resolveSave = useRef<((saved: string) => void) | null>(null)
  return (
    <>
      <Button onClick={() => resolveSave.current?.("最初の変更")}>
        保存応答を再現
      </Button>
      <CommunitySettings
        {...args}
        onSaveName={() =>
          new Promise<string>((resolve) => {
            resolveSave.current = resolve
          })
        }
      />
    </>
  )
}

export const NameEditedDuringSave: Story = {
  name: "Interaction · 保存中の新しい入力を保存応答から保護",
  tags: ["interaction"],
  render: (args) => <CommunityNamePendingSaveFixture {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: /Community名/ })
    await userEvent.clear(input)
    await userEvent.type(input, "最初の変更")
    await userEvent.click(canvas.getByRole("button", { name: "保存" }))
    await userEvent.clear(input)
    await userEvent.type(input, "保存中の追加変更")
    await userEvent.click(
      canvas.getByRole("button", { name: "保存応答を再現" }),
    )
    await expect(input).toHaveValue("保存中の追加変更")
    await expect(canvas.getByRole("button", { name: "保存" })).toBeEnabled()
  },
}
