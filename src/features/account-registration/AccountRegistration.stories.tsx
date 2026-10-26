import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { AccountRegistration } from "./AccountRegistration"

const meta = {
  title: "Features/Account Registration",
  component: AccountRegistration,
  args: {
    reviewState: "default",
    onRegister: fn(async () => "success" as const),
    onExit: fn(),
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AccountRegistration>

export default meta
type Story = StoryObj<typeof meta>

/** nicknameが無効なとき登録せず、修正理由を表示する。 */
export const InvalidNickname: Story = {
  name: "Interaction · Invalid Nickname",
  tags: ["interaction"],
  args: { reviewState: "no-display-name" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("ニックネームを入力してください。")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "登録" })).toBeDisabled()
    await expect(args.onRegister).not.toHaveBeenCalled()
  },
}

/** 終了Dialogを閉じても入力値を保持し、確定するまでLogoutしない。 */
export const ExitConfirmation: Story = {
  name: "Interaction · Exit Confirmation",
  tags: ["interaction"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "終了" }))
    const dialog = within(await within(document.body).findByRole("dialog", { name: "登録せずに終了しますか？" }))
    await waitFor(() => expect(dialog.getByText("登録せずに終了すると、ログアウトしてトップページに戻ります。")).toBeVisible())
    await userEvent.click(dialog.getByRole("button", { name: "戻る" }))
    await expect(args.onExit).not.toHaveBeenCalled()
    await expect(canvas.getByRole("textbox", { name: "ニックネーム" })).toHaveValue("ユーザー")
    await userEvent.click(canvas.getByRole("button", { name: "終了" }))
    const reopened = within(await within(document.body).findByRole("dialog", { name: "登録せずに終了しますか？" }))
    await userEvent.click(reopened.getByRole("button", { name: "終了" }))
    await expect(args.onExit).toHaveBeenCalledTimes(1)
  },
}

/** 登録処理中はFormと離脱を制限する。 */
export const Registering: Story = {
  name: "Interaction · Registering",
  tags: ["interaction"],
  args: { reviewState: "registering" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: "ニックネーム" })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "登録" })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "終了" })).toBeDisabled()
    await expect(args.onRegister).not.toHaveBeenCalled()
  },
}
