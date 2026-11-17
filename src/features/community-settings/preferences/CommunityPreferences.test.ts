import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { SettingsSectionResult } from "@/ui/SettingsSectionHost"
import { CommunityPreferences } from "./CommunityPreferences"

const mocks = vi.hoisted(() => ({
  connection: vi.fn(),
  alias: vi.fn(() => ({})),
  save: vi.fn(() => ({})),
  refreshError: vi.fn(),
  view: vi.fn(),
  setPreview: vi.fn(),
  clearPreview: vi.fn(),
}))

vi.mock("@/infrastructure/graphql/generated", () => ({
  useCommunityMySettingsQuery: mocks.connection,
}))
vi.mock("../useCommunitySettingsRefreshError", () => ({
  useCommunitySettingsRefreshError: mocks.refreshError,
}))
vi.mock("./useCommunityPreferencesSave", () => ({
  useCommunityPreferencesSave: mocks.save,
}))
vi.mock("./CommunityAliasSection/useCommunityAliasSave", () => ({
  useCommunityAliasSave: mocks.alias,
}))
vi.mock("@/features/application-shell", () => ({
  useCommunityAccentPreview: () => ({ setPreview: mocks.setPreview, clearPreview: mocks.clearPreview }),
}))
vi.mock("./CommunityPreferencesView", () => ({
  CommunityPreferencesView: (props: unknown) => {
    mocks.view(props)
    return createElement("div", null, "Community Preferences")
  },
}))

describe("CommunityPreferencesのSection取得状態", () => {
  let root: Root
  let element: HTMLDivElement
  let results: SettingsSectionResult[]

  beforeEach(() => {
    element = document.createElement("div")
    root = createRoot(element)
    results = []
    mocks.connection.mockReset()
    mocks.alias.mockClear()
    mocks.save.mockClear()
    mocks.refreshError.mockClear()
    mocks.view.mockClear()
    mocks.setPreview.mockReset()
    mocks.clearPreview.mockReset()
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  function renderSection() {
    act(() => {
      root.render(
        createElement(CommunityPreferences, {
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

  it("別Communityの取得値でReadyをMountしない", () => {
    mocks.connection.mockReturnValue({
      data: { community: { id: "club-b", mySettings: { accentColor: "#123456", alias: null } } },
      loading: false,
    })
    renderSection()
    expect(results.at(-1)?.status).toBe("error")
  })

  it("Readyの表示へAlias保存とCommunity単位のAccent Previewを接続する", () => {
    const saveAlias = vi.fn()
    const saveAccent = vi.fn()
    mocks.alias.mockReturnValue({ saveAlias })
    mocks.save.mockReturnValue({ save: saveAccent })
    mocks.setPreview.mockReturnValue(17)
    mocks.connection.mockReturnValue({
      data: {
        community: { id: "club-a", mySettings: { accentColor: "#123456", alias: "個人用" } },
      },
      loading: false,
      error: undefined,
    })

    renderSection()

    expect(mocks.alias).toHaveBeenCalledWith("club-a")
    expect(mocks.save).toHaveBeenCalledWith("club-a")
    expect(mocks.view).toHaveBeenCalledWith(expect.objectContaining({
      accent: "#123456",
      sourceReady: true,
      operations: expect.objectContaining({ save: saveAccent }),
      alias: { savedAlias: "個人用", onSave: saveAlias },
    }))
    const props = mocks.view.mock.lastCall?.[0] as {
      preview: { preview: (color: string) => number; release: (owner: number) => void }
    }
    expect(props.preview.preview("#AABBCC")).toBe(17)
    expect(mocks.setPreview).toHaveBeenCalledWith("club-a", "#AABBCC")
    props.preview.release(17)
    expect(mocks.clearPreview).toHaveBeenCalledWith("club-a", 17)
  })

  it("再取得中でも取得済み値を表示し、AutoSaveのsourceReadyをfalseにする", () => {
    mocks.connection.mockReturnValue({
      data: {
        community: { id: "club-a", mySettings: { accentColor: "#123456", alias: null } },
      },
      loading: true,
      error: undefined,
    })

    renderSection()

    expect(results.at(-1)?.status).toBe("ready")
    expect(mocks.view).toHaveBeenCalledWith(expect.objectContaining({
      sourceReady: false,
      alias: expect.objectContaining({ savedAlias: null }),
    }))
  })

  it("確定済みの設定がある場合はReadyを維持する", () => {
    mocks.connection.mockReturnValue({
      data: {
        community: { id: "club-a", mySettings: { accentColor: "#123456", alias: null } },
      },
      loading: false,
      error: new Error("refresh failed"),
    })
    renderSection()
    expect(results.at(-1)?.status).toBe("ready")
    expect(element.textContent).toContain("Community Preferences")
    expect(mocks.refreshError).toHaveBeenLastCalledWith(true)
    expect(mocks.connection).toHaveBeenCalledWith({
      variables: { communityId: "club-a" }, fetchPolicy: "network-only", refetchWritePolicy: "merge", notifyOnNetworkStatusChange: true,
    })
  })
})
