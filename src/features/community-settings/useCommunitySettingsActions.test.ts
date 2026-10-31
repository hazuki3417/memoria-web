import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { useCommunitySettingsActions } from "./useCommunitySettingsActions"

const mocks = vi.hoisted(() => ({
  rename: vi.fn(),
  changeRole: vi.fn(),
  remove: vi.fn(),
  leave: vi.fn(),
  notify: vi.fn(),
}))

vi.mock("@/components/Feedback", () => ({
  showNotification: mocks.notify,
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  MyCommunitiesDocument: { kind: "Document", name: "myCommunities" },
  CommunityMembersDocument: { kind: "Document", name: "communityMembers" },
  CommunityMemberRole: { Admin: "ADMIN", Member: "MEMBER" },
  useRenameCommunityMutation: () => [mocks.rename],
  useChangeCommunityMemberRoleMutation: () => [mocks.changeRole],
  useRemoveCommunityMemberMutation: () => [mocks.remove],
  useLeaveCommunityMutation: () => [mocks.leave],
}))

type Actions = ReturnType<typeof useCommunitySettingsActions>
let root: Root
let host: HTMLDivElement
let actions!: Actions

beforeEach(async () => {
  vi.clearAllMocks()
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(createElement(() => {
      actions = useCommunitySettingsActions("community-1")
      return null
    }))
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("Community設定のMutation契約", () => {
  it("Community名変更の成功はtrue、MyCommunitiesの再取得を要求する", async () => {
    mocks.rename.mockResolvedValue({ data: { renameCommunity: { community: { id: "community-1" } } } })
    expect(await actions.onSaveName("新しい名前")).toBe(true)
    expect(mocks.rename).toHaveBeenCalledWith(expect.objectContaining({
      variables: { input: { communityId: "community-1", name: "新しい名前" } },
      awaitRefetchQueries: true,
    }))
    expect(mocks.rename.mock.calls[0][0].refetchQueries).toHaveLength(1)
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("Community名変更の応答欠落と通信失敗をfalseとして通知する", async () => {
    mocks.rename.mockResolvedValueOnce({ data: null }).mockRejectedValueOnce(new Error("network"))
    expect(await actions.onSaveName("変更")).toBe(false)
    expect(await actions.onSaveName("変更")).toBe(false)
    expect(mocks.notify).toHaveBeenCalledTimes(2)
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ kind: "error" }))
  })

  it("メンバー除外成功はtrueと成功通知、CommunityMembersの再取得", async () => {
    mocks.remove.mockResolvedValue({ data: { removeCommunityMember: { success: true } } })
    expect(await actions.onRemoveMember("user-2")).toBe(true)
    expect(mocks.remove).toHaveBeenCalledWith(expect.objectContaining({
      variables: { input: { communityId: "community-1", userId: "user-2" } },
      awaitRefetchQueries: true,
    }))
    expect(mocks.remove.mock.calls[0][0].refetchQueries).toHaveLength(1)
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ kind: "success" }))
  })

  it("メンバー除外失敗はfalseとエラー通知", async () => {
    mocks.remove.mockResolvedValueOnce({ data: { removeCommunityMember: { success: false } } })
      .mockRejectedValueOnce(new Error("network"))
    expect(await actions.onRemoveMember("user-2")).toBe(false)
    expect(await actions.onRemoveMember("user-2")).toBe(false)
    expect(mocks.notify).toHaveBeenCalledTimes(2)
  })

  it("役割変更はGraphQL enumを使用し、成功時に再取得と通知", async () => {
    mocks.changeRole.mockResolvedValue({ data: { changeCommunityMemberRole: { success: true } } })
    expect(await actions.onChangeMemberRole("user-2", "admin")).toBe(true)
    expect(mocks.changeRole).toHaveBeenCalledWith(expect.objectContaining({
      variables: { input: { communityId: "community-1", userId: "user-2", role: "ADMIN" } },
      awaitRefetchQueries: true,
    }))
    expect(mocks.changeRole.mock.calls[0][0].refetchQueries).toHaveLength(1)
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ kind: "success" }))
  })

  it("役割変更失敗はfalseとエラー通知", async () => {
    mocks.changeRole.mockResolvedValue({ data: { changeCommunityMemberRole: { success: false } } })
    expect(await actions.onChangeMemberRole("user-2", "member")).toBe(false)
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ kind: "error" }))
  })

  it("退会成功時はMyCommunitiesを再取得し、失敗は例外を伝搬", async () => {
    mocks.leave.mockResolvedValueOnce({ data: { leaveCommunity: { success: true } } })
      .mockResolvedValueOnce({ data: { leaveCommunity: { success: false } } })
    await expect(actions.onLeaveCommunity()).resolves.toBeUndefined()
    expect(mocks.leave).toHaveBeenCalledWith(expect.objectContaining({
      variables: { communityId: "community-1" },
      awaitRefetchQueries: true,
    }))
    expect(mocks.leave.mock.calls[0][0].refetchQueries).toHaveLength(1)
    await expect(actions.onLeaveCommunity()).rejects.toThrow("leave failed")
  })
})
