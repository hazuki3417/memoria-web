import { act, createElement, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CommunityDeletionConfirmation } from "./CommunityDeletionConfirmation"

const mocks = vi.hoisted(() => ({
  notify: vi.fn(),
  navigate: vi.fn(),
  review: vi.fn(),
  delete: vi.fn(),
  push: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}))
vi.mock("@mantine/hooks", () => ({
  useMediaQuery: () => false,
}))
vi.mock("@/components/Feedback", async () => {
  const { createElement } = await import("react")
  return {
    showNotification: mocks.notify,
    FeedbackPanel: ({ children, actions, role }: {
      children?: ReactNode
      actions?: ReactNode
      role?: string
    }) => createElement("div", { role }, children, actions),
  }
})
vi.mock("@mantine/core", async () => {
  const { createElement } = await import("react")
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children)
  const Stepper = Object.assign(Container, { Step: Container })
  const Button = ({ children, onClick, disabled, loading }: {
    children?: ReactNode
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
  }) => createElement("button", { type: "button", onClick, disabled: disabled || loading }, children)
  const TextInput = ({ label, onChange, disabled }: {
    label: string
    onChange: (event: { currentTarget: { value: string } }) => void
    disabled?: boolean
  }) => createElement("button", {
    type: "button",
    disabled,
    onClick: () => onChange({ currentTarget: { value: "家族のアルバム" } }),
  }, label)
  const Modal = ({ opened, children }: { opened: boolean; children?: ReactNode }) =>
    opened ? createElement("div", null, children) : null
  return {
    Box: Container, Group: Container, Stack: Container, Text: Container,
    Title: Container, Divider: Container, Stepper, Button, TextInput, Modal,
  }
})

let host: HTMLDivElement | undefined
let root: Root | undefined

const click = async (name: string) => {
  const button = [...(host?.querySelectorAll("button") ?? [])].find(
    (element) => element.textContent === name && !element.disabled,
  )
  if (!button) throw new Error(`操作可能なButtonがありません: ${name}`)
  await act(async () => { button.click() })
}

const mount = async () => {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root?.render(createElement(CommunityDeletionConfirmation, {
      communityId: "community-1",
      communityName: "家族のアルバム",
      managedMediaCount: 3,
      isAdministrator: true,
      onDelete: mocks.delete,
      onNavigate: mocks.navigate,
      onReviewChanged: mocks.review,
    }))
  })
}

const submit = async () => {
  await click("次へ")
  await click("次へ")
  await click("確認のためCommunity名を入力してください")
  await click("Communityを削除する")
}

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(async () => {
  if (root) await act(async () => { root?.unmount() })
  host?.remove()
  root = undefined
  host = undefined
})

describe("Community削除の受付結果と通知例外の独立契約", () => {
  it.each(["succeeded", "failed"] as const)(
    "受付確定(sync=%s)後の通知例外でもDashboardへ遷移し、再送しない",
    async (sync) => {
      mocks.delete.mockResolvedValue({ kind: "accepted", sync })
      mocks.notify.mockImplementation(() => { throw new Error("notification unavailable") })
      await mount()
      await submit()
      expect(mocks.delete).toHaveBeenCalledTimes(1)
      expect(mocks.navigate).toHaveBeenCalledTimes(1)
      expect(mocks.navigate).toHaveBeenCalledWith("/dashboard")
      expect(host?.textContent).not.toContain("削除受付の結果を確認できませんでした")
      const deleteButton = [...(host?.querySelectorAll("button") ?? [])].find(
        (element) => element.textContent === "Communityを削除する",
      )
      expect(deleteButton?.disabled).toBe(true)
    },
  )

  it("同期失敗の警告通知が例外でも受付確定と遷移を維持する", async () => {
    mocks.delete.mockResolvedValue({ kind: "accepted", sync: "failed" })
    mocks.notify.mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => { throw new Error("warning unavailable") })
    await mount()
    await submit()
    expect(mocks.notify).toHaveBeenCalledTimes(2)
    expect(mocks.navigate).toHaveBeenCalledTimes(1)
    expect(mocks.navigate).toHaveBeenCalledWith("/dashboard")
    expect(mocks.delete).toHaveBeenCalledTimes(1)
  })

  it.each(["review-changed", "not-accepted"] as const)(
    "%sで通知例外が起きても最新Reviewを取得し、古い確認から再送しない",
    async (kind) => {
      mocks.delete.mockResolvedValue({ kind })
      mocks.notify.mockImplementation(() => { throw new Error("notification unavailable") })
      await mount()
      await submit()
      expect(mocks.review).toHaveBeenCalledTimes(1)
      expect(mocks.navigate).not.toHaveBeenCalled()
      expect(mocks.delete).toHaveBeenCalledTimes(1)
      const deleteButton = [...(host?.querySelectorAll("button") ?? [])].find(
        (element) => element.textContent === "Communityを削除する",
      )
      expect(deleteButton?.disabled).toBe(true)
    },
  )
})
