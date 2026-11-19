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
  refetch: vi.fn(),
}))

vi.mock("@apollo/client", () => ({
  useApolloClient: () => ({ refetchQueries: mocks.refetch }),
}))

vi.mock("@/components/Feedback", () => ({
  showNotification: mocks.notify,
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  MyCommunitiesDocument: { kind: "Document", name: "myCommunities" },
  CommunityMembersDocument: { kind: "Document", name: "communityMembers" },
  CommunitySettingsMembersDocument: { kind: "Document", name: "communitySettingsMembers" },
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
  mocks.refetch.mockResolvedValue([])
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
      }),
    )
    expect(mocks.refetch).toHaveBeenCalledWith({
      include: [
        { kind: "Document", name: "communityMembers" },
        { kind: "Document", name: "communitySettingsMembers" },
      ],
    })
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
      }),
    )
    expect(mocks.refetch).toHaveBeenCalledWith({
      include: [
        { kind: "Document", name: "communityMembers" },
        { kind: "Document", name: "communitySettingsMembers" },
      ],
    })
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

  it("除外はMutation Promiseが完了するまで成功を通知しない", async () => {
    let resolveMutation!: (value: { data: { removeCommunityMember: { success: boolean } } }) => void
    mocks.remove.mockReturnValue(new Promise((resolve) => {
      resolveMutation = resolve
    }))
    const attempt = actions.onRemoveMember("user-2")
    expect(mocks.notify).not.toHaveBeenCalled()
    resolveMutation({ data: { removeCommunityMember: { success: true } } })
    await expect(attempt).resolves.toBe(true)
    expect(mocks.notify).toHaveBeenCalledTimes(1)
  })

  it("役割変更はMutation Promiseの拒否時に成功と断定しない", async () => {
    mocks.changeRole.mockRejectedValue(new Error("mutation or refetch failed"))
    await expect(actions.onChangeMemberRole("user-2", "member")).resolves.toBe(false)
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("退会はMutation Promiseの完了まで継続し、拒否時は成功を返さない", async () => {
    let rejectMutation!: (reason: Error) => void
    mocks.leave.mockReturnValue(new Promise((_resolve, reject) => {
      rejectMutation = reject
    }))
    const attempt = actions.onLeaveCommunity()
    rejectMutation(new Error("mutation or refetch failed"))
    await expect(attempt).rejects.toThrow("mutation or refetch failed")
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("除外Mutation成功後のRefetch失敗は確定成功と同期失敗警告に分ける", async () => {
    mocks.remove.mockResolvedValue({ data: { removeCommunityMember: { success: true } } })
    mocks.refetch.mockRejectedValue(new Error("refetch failed"))
    await expect(actions.onRemoveMember("user-2")).resolves.toBe(true)
    expect(mocks.notify).toHaveBeenCalledOnce()
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({
      kind: "warning",
      description: expect.stringContaining("除外は完了しています"),
    }))
    expect(mocks.remove).toHaveBeenCalledTimes(1)
  })

  it("Role変更確定後にRefetch結果がGraphQLエラーでも再送しない", async () => {
    mocks.changeRole.mockResolvedValue({ data: { changeCommunityMemberRole: { success: true } } })
    mocks.refetch.mockResolvedValue([{ errors: [{ message: "network" }] }])
    await expect(actions.onChangeMemberRole("user-2", "admin")).resolves.toBe(true)
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({
      kind: "warning",
      description: expect.stringContaining("役割変更は完了しています"),
    }))
    expect(mocks.changeRole).toHaveBeenCalledTimes(1)
  })

  it("Mutation拒否とMutation結果不明ではRefetchも成功通知も行わない", async () => {
    mocks.remove.mockResolvedValue({ data: { removeCommunityMember: { success: false } } })
    mocks.changeRole.mockRejectedValue(new Error("unknown"))
    await expect(actions.onRemoveMember("user-2")).resolves.toBe(false)
    await expect(actions.onChangeMemberRole("user-2", "member")).resolves.toBe(false)
    expect(mocks.refetch).not.toHaveBeenCalled()
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("退会確定後のRefetch失敗でもDashboardへ進むため成功Outcomeを返す", async () => {
    mocks.leave.mockResolvedValue({ data: { leaveCommunity: { success: true } } })
    mocks.refetch.mockRejectedValue(new Error("my communities unavailable"))
    await expect(actions.onLeaveCommunity()).resolves.toBeUndefined()
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({
      kind: "warning",
      description: expect.stringContaining("退会は成立しています"),
    }))
    expect(mocks.leave).toHaveBeenCalledTimes(1)
  })

  it("Refetch待機中は成功通知せず、完了後にMutation成功を確定表示する", async () => {
    let resolveRefetch!: (value: never[]) => void
    mocks.remove.mockResolvedValue({ data: { removeCommunityMember: { success: true } } })
    mocks.refetch.mockReturnValue(new Promise((resolve) => {
      resolveRefetch = resolve
    }))
    const attempt = actions.onRemoveMember("user-2")
    await Promise.resolve()
    await Promise.resolve()
    expect(mocks.notify).not.toHaveBeenCalled()
    resolveRefetch([])
    await expect(attempt).resolves.toBe(true)
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ kind: "success" }))
  })

  it("退会成功時はMyCommunitiesを再取得し、失敗は例外を伝搬", async () => {
    mocks.leave
      .mockResolvedValueOnce({ data: { leaveCommunity: { success: true } } })
      .mockResolvedValueOnce({ data: { leaveCommunity: { success: false } } })
    await expect(actions.onLeaveCommunity()).resolves.toBeUndefined()
    expect(mocks.leave).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { communityId: "community-1" },
      }),
    )
    expect(mocks.refetch).toHaveBeenCalledWith({
      include: [{ kind: "Document", name: "myCommunities" }],
    })
    await expect(actions.onLeaveCommunity()).rejects.toThrow("leave failed")
  })

  it.each(["role", "removal"] as const)(
    "%s成立後の通知例外は確定した成功を取り消さない",
    async (kind) => {
      mocks.notify.mockImplementation(() => { throw new Error("notification unavailable") })
      if (kind === "role") {
        mocks.changeRole.mockResolvedValue({
          data: { changeCommunityMemberRole: { success: true } },
        })
        await expect(actions.onChangeMemberRole("user-2", "admin")).resolves.toBe(true)
        expect(mocks.changeRole).toHaveBeenCalledTimes(1)
      } else {
        mocks.remove.mockResolvedValue({
          data: { removeCommunityMember: { success: true } },
        })
        await expect(actions.onRemoveMember("user-2")).resolves.toBe(true)
        expect(mocks.remove).toHaveBeenCalledTimes(1)
      }
      expect(mocks.notify).toHaveBeenCalledTimes(1)
    },
  )

  it("退会成立後の同期警告が例外でも成功Outcomeを維持する", async () => {
    mocks.leave.mockResolvedValue({ data: { leaveCommunity: { success: true } } })
    mocks.refetch.mockRejectedValue(new Error("refetch unavailable"))
    mocks.notify.mockImplementation(() => { throw new Error("notification unavailable") })
    await expect(actions.onLeaveCommunity()).resolves.toBeUndefined()
    expect(mocks.leave).toHaveBeenCalledTimes(1)
    expect(mocks.notify).toHaveBeenCalledTimes(1)
  })
})
