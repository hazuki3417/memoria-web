import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { SettingsSectionResult } from "@/ui/SettingsSectionHost"
import { defaultUserPreferences } from "./userPreferences"
import { PersonalPreferences } from "./PersonalPreferences"

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  save: vi.fn(),
  inspect: vi.fn(),
  view: vi.fn(),
  refreshError: vi.fn(),
  compact: vi.fn(),
}))

vi.mock("@/infrastructure/graphql/generated", () => ({
  usePersonalSettingsPreferencesQuery: (...args: unknown[]) => mocks.query(...args),
}))
vi.mock("@mantine/hooks", () => ({
  useMediaQuery: (...args: unknown[]) => mocks.compact(...args),
}))
vi.mock("../usePersonalSettingsInspection", () => ({
  usePersonalSettingsInspection: () => ({ inspectPreferences: mocks.inspect }),
}))
vi.mock("../usePersonalSettingsRefreshError", () => ({
  usePersonalSettingsRefreshError: (...args: unknown[]) => mocks.refreshError(...args),
}))
vi.mock("./usePersonalPreferencesSave", () => ({
  usePersonalPreferencesSave: () => ({ savePreferencesAction: mocks.save }),
}))
vi.mock("./userPreferencesGraphqlAdapter", () => ({
  fromGraphqlUserPreferences: () => defaultUserPreferences,
}))
vi.mock("./PersonalPreferencesView", () => ({
  PersonalPreferencesView: (props: unknown) => { mocks.view(props); return null },
}))

let root: Root
let host: HTMLDivElement
const refetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  mocks.compact.mockReturnValue(false)
  mocks.query.mockReturnValue({
    data: undefined,
    loading: true,
    error: undefined,
    refetch,
  })
})

afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

const renderHost = vi.fn((result: SettingsSectionResult) =>
  result.status === "ready" ? result.content : null)

describe("PersonalPreferencesはProfileと同じQuery/Action/Hostの入口", () => {
  it("Loading時はReady ViewをMountしない", async () => {
    await act(async () => root.render(createElement(PersonalPreferences, { render: renderHost })))
    expect(renderHost).toHaveBeenCalledWith({ status: "loading" })
    expect(mocks.view).not.toHaveBeenCalled()
  })

  it("Error時はRetryをHostへ提供する", async () => {
    mocks.query.mockReturnValue({ data: undefined, loading: false, refetch })
    await act(async () => root.render(createElement(PersonalPreferences, { render: renderHost })))
    expect(renderHost).toHaveBeenCalledWith(expect.objectContaining({
      status: "error", retry: expect.any(Function),
    }))
    expect(mocks.view).not.toHaveBeenCalled()
  })

  it("Ready時だけViewへ初期値・Action・Inspectionを接続する", async () => {
    mocks.compact.mockReturnValue(true)
    mocks.query.mockReturnValue({
      data: { me: { preferences: {} } }, loading: false, error: undefined, refetch,
    })
    await act(async () => root.render(createElement(PersonalPreferences, { render: renderHost })))
    expect(renderHost).toHaveBeenCalledWith(expect.objectContaining({ status: "ready" }))
    expect(mocks.view).toHaveBeenCalledWith(expect.objectContaining({
      compact: true,
      initialPreferences: defaultUserPreferences,
      onSaveAction: mocks.save,
      onInspect: mocks.inspect,
    }))
    expect(mocks.refreshError).toHaveBeenCalledWith(false)
  })
})
