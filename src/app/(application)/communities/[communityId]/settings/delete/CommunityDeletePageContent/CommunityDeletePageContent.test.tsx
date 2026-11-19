import { act, createElement, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CommunityDeletePageContent } from "./CommunityDeletePageContent"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  notify: vi.fn(),
  query: vi.fn(),
  pending: vi.fn(),
  accept: vi.fn(),
  inspect: vi.fn(),
  begin: vi.fn(),
  markUnknown: vi.fn(),
  clearRejected: vi.fn(),
  confirmation: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useParams: () => ({ communityId: "community-1" }),
  useRouter: () => ({ push: mocks.push }),
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  useCommunityDeletionSnapshotQuery: mocks.query,
}))
vi.mock("@/components/Feedback", () => ({ showNotification: mocks.notify }))
vi.mock("@/components/LoadingBoundary/LoadingBoundary", () => ({
  LoadingBoundary: () => createElement("div", null, "Loading"),
}))
vi.mock("@/features/community-deletion", () => ({
  useCommunityDeletionAcceptance: () => ({
    acceptDeletion: mocks.accept,
    inspectAcceptance: mocks.inspect,
  }),
  useCommunityDeletionPendingOperation: mocks.pending,
  CommunityDeletionConfirmation: (props: unknown) => {
    mocks.confirmation(props)
    return createElement("div", null, "Confirmation")
  },
}))
vi.mock("@mantine/core", () => ({
  Stack: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  Alert: ({ title, children }: { title: string; children: ReactNode }) =>
    createElement("div", null, title, children),
  Button: ({ children, onClick, disabled, loading }: {
    children: ReactNode
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }) => createElement("button", { onClick, disabled: disabled || loading }, children),
}))

let root: Root | undefined
let host: HTMLDivElement | undefined

const renderRoute = async () => {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root?.render(createElement(CommunityDeletePageContent)) })
}

const click = async (name: string) => {
  const button = [...(host?.querySelectorAll("button") ?? [])]
    .find((element) => element.textContent === name)
  if (!button) throw new Error(`Button not found: ${name}`)
  await act(async () => { button.click() })
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.query.mockReturnValue({
    data: { communityDeletionSnapshot: {
      revision: "revision-1", name: "家族のアルバム", managedMediaCount: 3,
    } },
    loading: false,
    refetch: vi.fn(),
  })
  mocks.pending.mockReturnValue({
    status: "ready",
    operation: { operationId: "operation-1", revision: "revision-1" },
    recovering: true,
    begin: mocks.begin,
    markUnknown: mocks.markUnknown,
    clearRejected: mocks.clearRejected,
  })
})

afterEach(async () => {
  if (root) await act(async () => { root?.unmount() })
  host?.remove()
  root = undefined
  host = undefined
})

describe("Community削除の結果不明時の取得専用Recovery", () => {
  it("Snapshotを再取得中でもConfirmationを再Mountせず受付照会だけを表示する", async () => {
    mocks.query.mockReturnValue({ data: undefined, loading: true })
    await renderRoute()
    expect(mocks.confirmation).not.toHaveBeenCalled()
    expect(host?.textContent).toContain("受付状況を確認する")
    expect(host?.textContent).not.toContain("Confirmation")
  })

  it("受付確定記録の照会が成功した場合のみDashboardへ遷移する", async () => {
    mocks.inspect.mockResolvedValue(true)
    mocks.notify.mockImplementation(() => { throw new Error("notification unavailable") })
    await renderRoute()
    await click("受付状況を確認する")
    expect(mocks.inspect).toHaveBeenCalledWith("operation-1")
    expect(mocks.accept).not.toHaveBeenCalled()
    expect(mocks.push).toHaveBeenCalledWith("/dashboard")
  })

  it("受付記録が未検出ならUnknownを維持し、削除を再送しない", async () => {
    mocks.inspect.mockResolvedValue(false)
    await renderRoute()
    await click("受付状況を確認する")
    expect(host?.textContent).toContain("受付結果を確定できません")
    expect(mocks.accept).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it("受付Callbackが例外を投げてもOperationを解除せずUnknownを返す", async () => {
    mocks.pending.mockReturnValue({
      status: "ready",
      operation: null,
      recovering: false,
      begin: mocks.begin,
      markUnknown: mocks.markUnknown,
      clearRejected: mocks.clearRejected,
    })
    mocks.begin.mockReturnValue("operation-1")
    mocks.accept.mockRejectedValue(new Error("unexpected callback failure"))
    await renderRoute()
    expect(mocks.confirmation).toHaveBeenCalled()
    const confirmation = mocks.confirmation.mock.lastCall?.[0] as {
      onDelete: () => Promise<{ kind: string }>
    }
    let result: { kind: string } | undefined
    await act(async () => { result = await confirmation.onDelete() })
    expect(result).toEqual({ kind: "unknown" })
    expect(mocks.markUnknown).toHaveBeenCalledWith("operation-1")
    expect(mocks.clearRejected).not.toHaveBeenCalled()
  })

  it("保存状態が破損した場合は削除Confirmationを表示しない", async () => {
    mocks.pending.mockReturnValue({ status: "unavailable", operation: null, recovering: false })
    await renderRoute()
    expect(host?.textContent).toContain("削除操作の安全な状態を確認できません")
    expect(mocks.confirmation).not.toHaveBeenCalled()
    expect(mocks.accept).not.toHaveBeenCalled()
  })
})
