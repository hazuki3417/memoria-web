import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { useCommunityMemberRemovalAction } from "./useCommunityMemberRemovalAction"
import { useCommunityLeaveAction } from "./useCommunityLeaveAction"
import { useCommunityRoleChangeAction } from "./useCommunityRoleChangeAction"

const mocks = vi.hoisted(() => ({
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
  useChangeCommunityMemberRoleMutation: () => [mocks.changeRole],
  useRemoveCommunityMemberMutation: () => [mocks.remove],
  useLeaveCommunityMutation: () => [mocks.leave],
}))

type Actions = ReturnType<typeof useCommunityMemberRemovalAction> &
  ReturnType<typeof useCommunityLeaveAction> &
  ReturnType<typeof useCommunityRoleChangeAction>
let root: Root
let host: HTMLDivElement
let actions!: Actions

beforeEach(async () => {
  vi.resetAllMocks()
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(
      createElement(() => {
        actions = {
          ...useCommunityMemberRemovalAction("community-1"),
          ...useCommunityLeaveAction("community-1"),
          ...useCommunityRoleChangeAction("community-1"),
        }
        return null
      }),
    )
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("Communityメンバー管理のMutation契約", () => {
  it("メンバー除外成功はtrueと成功通知、CommunityMembersの再取得", async () => {
    mocks.remove.mockResolvedValue({
      data: { removeCommunityMember: { success: true } },
    })
    expect(await actions.onRemoveMember("user-2")).toBe(true)
    expect(mocks.remove).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { communityId: "community-1", userId: "user-2" } },
        awaitRefetchQueries: true,
      }),
    )
    expect(mocks.remove.mock.calls[0][0].refetchQueries).toHaveLength(1)
    expect(mocks.notify).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "success" }),
    )
  })

  it("メンバー除外の結果未確定はfalseを返し、失敗通知はFormへ委譲", async () => {
    mocks.remove
      .mockResolvedValueOnce({
        data: { removeCommunityMember: { success: false } },
      })
      .mockRejectedValueOnce(new Error("network"))
    expect(await actions.onRemoveMember("user-2")).toBe(false)
    expect(await actions.onRemoveMember("user-2")).toBe(false)
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("役割変更はGraphQL enumを使用し、成功時に再取得と通知", async () => {
    mocks.changeRole.mockResolvedValue({
      data: { changeCommunityMemberRole: { success: true } },
    })
    expect(await actions.onChangeMemberRole("user-2", "admin")).toBe(true)
    expect(mocks.changeRole).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            communityId: "community-1",
            userId: "user-2",
            role: "ADMIN",
          },
        },
        awaitRefetchQueries: true,
      }),
    )
    expect(mocks.changeRole.mock.calls[0][0].refetchQueries).toHaveLength(1)
    expect(mocks.notify).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "success" }),
    )
  })

  it("役割変更失敗はfalseを返し、失敗通知はModalに委譲", async () => {
    mocks.changeRole.mockResolvedValue({
      data: { changeCommunityMemberRole: { success: false } },
    })
    expect(await actions.onChangeMemberRole("user-2", "member")).toBe(false)
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("退会成功時はMyCommunitiesを再取得し、失敗は例外を伝搬", async () => {
    mocks.leave
      .mockResolvedValueOnce({ data: { leaveCommunity: { success: true } } })
      .mockResolvedValueOnce({ data: { leaveCommunity: { success: false } } })
    await expect(actions.onLeaveCommunity()).resolves.toBeUndefined()
    expect(mocks.leave).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { communityId: "community-1" },
        awaitRefetchQueries: true,
      }),
    )
    expect(mocks.leave.mock.calls[0][0].refetchQueries).toHaveLength(1)
    await expect(actions.onLeaveCommunity()).rejects.toThrow("leave failed")
  })
})
