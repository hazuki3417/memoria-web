import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { CommunityDeletionConfirmation } from "./CommunityDeletionConfirmation"

const meta = {
  id: "features-community-deletion-communitydeletionconfirmation",
  title: "features/community-deletion/CommunityDeletionConfirmation",
  component: CommunityDeletionConfirmation,
  args: {
    communityId: "community-1",
    communityName: "家族のアルバム",
    managedMediaCount: 3,
    isAdministrator: true,
    onNavigate: fn(),
    onReviewChanged: fn(),
  },
} satisfies Meta<typeof CommunityDeletionConfirmation>

export default meta
type Story = StoryObj<typeof meta>

async function confirmDeletion(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole("button", { name: "次へ" }))
  await userEvent.click(canvas.getByRole("button", { name: "次へ" }))
  const input = canvas.getByRole("textbox", { name: /確認のためCommunity名を入力/ })
  await userEvent.type(input, "家族のアルバム")
  await userEvent.click(canvas.getByRole("button", { name: "Communityを削除する" }))
}

export const Accepted: Story = {
  name: "Interaction · 受付確定後にDashboardへ遷移",
  tags: ["interaction"],
  args: { onDelete: fn(async () => ({ kind: "accepted" as const, sync: "succeeded" as const })) },
  play: async ({ canvasElement, args }) => {
    await confirmDeletion(canvasElement)
    await waitFor(() => expect(args.onNavigate).toHaveBeenCalledWith("/dashboard"))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

export const AcceptedRefetchFailed: Story = {
  name: "Interaction · 受付成立後の同期失敗でも遷移する",
  tags: ["interaction"],
  args: { onDelete: fn(async () => ({ kind: "accepted" as const, sync: "failed" as const })) },
  play: async ({ canvasElement, args }) => {
    await confirmDeletion(canvasElement)
    await waitFor(() => expect(args.onNavigate).toHaveBeenCalledWith("/dashboard"))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

export const RevisionChanged: Story = {
  name: "Interaction · Revision競合は最新Reviewを要求する",
  tags: ["interaction"],
  args: { onDelete: fn(async () => ({ kind: "review-changed" as const })) },
  play: async ({ canvasElement, args }) => {
    await confirmDeletion(canvasElement)
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toHaveTextContent("最新の内容で確認をやり直してください")
    await expect(args.onReviewChanged).toHaveBeenCalledTimes(1)
    await expect(canvas.getByRole("button", { name: "Communityを削除する" })).toBeDisabled()
    await expect(args.onNavigate).not.toHaveBeenCalled()
  },
}

export const NotAccepted: Story = {
  name: "Interaction · 明示的な未受付はReviewを再取得する",
  tags: ["interaction"],
  args: { onDelete: fn(async () => ({ kind: "not-accepted" as const })) },
  play: async ({ canvasElement, args }) => {
    await confirmDeletion(canvasElement)
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toHaveTextContent("削除は受け付けられませんでした")
    await expect(args.onReviewChanged).toHaveBeenCalledTimes(1)
    await expect(canvas.getByRole("button", { name: "Communityを削除する" })).toBeDisabled()
    await expect(args.onNavigate).not.toHaveBeenCalled()
  },
}

export const UnknownLocked: Story = {
  name: "Interaction · 受付結果不明は再送を停止する",
  tags: ["interaction"],
  args: { onDelete: fn(async () => ({ kind: "unknown" as const })) },
  play: async ({ canvasElement, args }) => {
    await confirmDeletion(canvasElement)
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toHaveTextContent("削除受付の結果を確認できませんでした")
    await expect(canvas.getByRole("button", { name: "Communityを削除する" })).toBeDisabled()
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
    await expect(args.onNavigate).not.toHaveBeenCalled()
  },
}
