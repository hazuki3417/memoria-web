import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import { useCommunityRoleChangeState } from "./useCommunityRoleChangeState"

const admin: CommunityMember = {
  id: "admin-a", name: "管理者A", role: "admin",
}
const member: CommunityMember = {
  id: "member-b", name: "参加者B", role: "member",
}
let host: HTMLDivElement | undefined
let root: Root | undefined
let state!: ReturnType<typeof useCommunityRoleChangeState>

const mount = async ({
  onChangeRole,
  adminCount = 2,
  adminLimitReached = false,
}: {
  onChangeRole?: (userId: string, role: "admin" | "member") => Promise<boolean>
  adminCount?: number
  adminLimitReached?: boolean
}) => {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root?.render(createElement(() => {
      state = useCommunityRoleChangeState({ onChangeRole, adminCount, adminLimitReached })
      return null
    }))
  })
}

afterEach(async () => {
  if (root) await act(async () => { root?.unmount() })
  host?.remove()
  host = undefined
  root = undefined
})

describe("Role変更の既存State制約", () => {
  it("最後のAdministratorを降格しない", async () => {
    const change = vi.fn().mockResolvedValue(true)
    await mount({ onChangeRole: change, adminCount: 1 })
    await act(async () => {
      state.setRoleTarget(admin)
      state.setSelectedRole("member")
    })
    await act(async () => { await state.confirmRoleChange() })
    expect(change).not.toHaveBeenCalled()
    expect(state.roleTarget?.id).toBe(admin.id)
    expect(state.roleBusy).toBe(false)
  })

  it("Administrator上限時の昇格と同一Roleへの変更を送らない", async () => {
    const change = vi.fn().mockResolvedValue(true)
    await mount({ onChangeRole: change, adminCount: 3, adminLimitReached: true })
    await act(async () => {
      state.setRoleTarget(member)
      state.setSelectedRole("admin")
    })
    await act(async () => { await state.confirmRoleChange() })
    expect(change).not.toHaveBeenCalled()
    await act(async () => { state.setSelectedRole("member") })
    await act(async () => { await state.confirmRoleChange() })
    expect(change).not.toHaveBeenCalled()
  })

  it("確定成功で対象を閉じ、成立不明では対象と再送防止フラグを維持する", async () => {
    const change = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    await mount({ onChangeRole: change })
    await act(async () => {
      state.setRoleTarget(member)
      state.setSelectedRole("admin")
    })
    await act(async () => { await state.confirmRoleChange() })
    expect(state.roleTarget?.id).toBe(member.id)
    expect(state.roleError).toBe(true)
    await act(async () => { await state.confirmRoleChange() })
    expect(change).toHaveBeenCalledTimes(1)
    await act(async () => { state.setRoleError(false) })
    await act(async () => { await state.confirmRoleChange() })
    expect(change).toHaveBeenCalledTimes(2)
    expect(state.roleTarget).toBeNull()
    expect(state.roleBusy).toBe(false)
  })

  it("実行中は同じ変更を重複送信しない", async () => {
    let resolve!: (confirmed: boolean) => void
    const change = vi.fn().mockReturnValue(new Promise<boolean>((done) => { resolve = done }))
    await mount({ onChangeRole: change })
    await act(async () => {
      state.setRoleTarget(member)
      state.setSelectedRole("admin")
    })
    let pending!: Promise<void>
    act(() => {
      pending = state.confirmRoleChange()
    })
    expect(state.roleBusy).toBe(true)
    await act(async () => { await state.confirmRoleChange() })
    expect(change).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolve(true)
      await pending
    })
    expect(state.roleTarget).toBeNull()
  })
})
