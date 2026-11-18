import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"
import type { CommunityMember } from "@/features/community/CommunityProvider"
import { useCommunityMemberTableState } from "./useCommunityMemberTableState"

const members: CommunityMember[] = [
  { id: "self", name: "ユーザー", role: "admin", isSelf: true },
  { id: "ten", name: "Member 10", role: "member" },
  { id: "two", name: "Member 2", role: "admin" },
]
let root: Root | null = null
let container: HTMLDivElement | null = null
let state!: ReturnType<typeof useCommunityMemberTableState>

async function mount() {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root?.render(createElement(() => {
      state = useCommunityMemberTableState(members)
      return null
    }))
  })
}

afterEach(async () => {
  if (root) await act(async () => root?.unmount())
  container?.remove()
  root = null
  container = null
})

describe("Community Membersの単一column Sort", () => {
  it("初期表示は名前昇順でaria-sortも一致する", async () => {
    await mount()
    expect(state.sort).toEqual({ key: "name", direction: "asc" })
    expect(state.rows.map((item) => item.id)).toEqual(["two", "ten", "self"])
    expect(state.ariaSort("name")).toBe("ascending")
    expect(state.ariaSort("role")).toBe("none")
  })

  it("同じcolumnは降順・昇順を交互に切り替え、sortなしへ戻らない", async () => {
    await mount()
    await act(async () => state.changeSort("name"))
    expect(state.sort).toEqual({ key: "name", direction: "desc" })
    expect(state.rows.map((item) => item.id)).toEqual(["self", "ten", "two"])
    await act(async () => state.changeSort("name"))
    expect(state.sort).toEqual({ key: "name", direction: "asc" })
  })

  it("別columnへの変更は昇順から開始し、検索語を維持する", async () => {
    await mount()
    await act(async () => state.setQuery("Member"))
    await act(async () => state.changeSort("role"))
    expect(state.query).toBe("Member")
    expect(state.sort).toEqual({ key: "role", direction: "asc" })
    expect(state.ariaSort("name")).toBe("none")
    expect(state.ariaSort("role")).toBe("ascending")
    expect(state.rows.map((item) => item.id)).toEqual(["two", "ten"])
  })
})
