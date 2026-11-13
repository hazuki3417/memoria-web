import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { SettingsSectionResult } from "@/ui/SettingsSectionHost"
import { ConnectedCommunityPreferences } from "./ConnectedCommunityPreferences"

const mocks = vi.hoisted(() => ({
  connection: vi.fn(),
  alias: vi.fn(() => ({})),
}))

vi.mock("./useCommunityPreferencesConnection", () => ({
  useCommunityPreferencesConnection: mocks.connection,
}))
vi.mock("../CommunityAliasSection/useCommunityAliasSave", () => ({
  useCommunityAliasSave: mocks.alias,
}))
vi.mock("../CommunityPreferencesSection", () => ({
  CommunityPreferencesSection: () => createElement("div", null, "Community Preferences"),
}))

describe("ConnectedCommunityPreferencesのSection取得状態", () => {
  let root: Root
  let element: HTMLDivElement
  let results: SettingsSectionResult[]

  beforeEach(() => {
    element = document.createElement("div")
    root = createRoot(element)
    results = []
    mocks.connection.mockReset()
    mocks.alias.mockClear()
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  function renderSection() {
    act(() => {
      root.render(
        createElement(ConnectedCommunityPreferences, {
          communityId: "club-a",
          render: (next) => {
            results.push(next)
            return next.status === "ready" ? next.content : null
          },
        }),
      )
    })
  }

  it("初回取得中はReady UIをMountしない", () => {
    mocks.connection.mockReturnValue({ data: undefined, loading: true })
    renderSection()
    expect(results.at(-1)).toEqual({ status: "loading" })
    expect(element.textContent).not.toContain("Community Preferences")
  })

  it("取得失敗時に共通Hostへ再取得操作を提供する", async () => {
    const refetch = vi.fn().mockResolvedValue({})
    mocks.connection.mockReturnValue({ data: undefined, loading: false, refetch })
    renderSection()

    const errorResult = results.at(-1)
    if (errorResult?.status !== "error") throw new Error("Section must be error")
    expect(errorResult.retry).toBeTypeOf("function")
    await act(async () => errorResult.retry?.())
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it("確定済みの設定がある場合はReadyを維持する", () => {
    mocks.connection.mockReturnValue({
      data: {
        community: { mySettings: { accentColor: "#123456", alias: null } },
      },
      loading: false,
      snapshot: { failure: null },
      controller: {},
      canResave: false,
    })
    renderSection()
    expect(results.at(-1)?.status).toBe("ready")
    expect(element.textContent).toContain("Community Preferences")
  })
})
