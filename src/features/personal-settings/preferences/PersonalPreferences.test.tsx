import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defaultUserPreferences } from "./userPreferences"
import { PersonalPreferences } from "./PersonalPreferences"

const mocks = vi.hoisted(() => ({
  connection: vi.fn(),
  form: vi.fn(),
}))

vi.mock("./usePersonalPreferencesConnection", () => ({
  usePersonalPreferencesConnection: () => mocks.connection(),
}))
vi.mock("./usePersonalPreferencesForm", () => ({
  usePersonalPreferencesForm: (...args: unknown[]) => mocks.form(...args),
}))
vi.mock("./PersonalPreferencesView", () => ({
  PersonalPreferencesView: () => null,
}))

let root: Root
let host: HTMLDivElement

beforeEach(() => {
  vi.clearAllMocks()
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  mocks.connection.mockReturnValue({
    initialPreferences: null,
    loading: true,
    retry: vi.fn(),
    compact: false,
    savePreferencesAction: vi.fn(),
    inspectPreferences: vi.fn(),
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("PersonalPreferencesの単一公開入口", () => {
  it("QueryのLoading中はHostへ状態だけを返しFormを作らない", async () => {
    const render = vi.fn(() => null)
    await act(async () => root.render(createElement(PersonalPreferences, { render })))
    expect(render).toHaveBeenCalledWith({ status: "loading" })
    expect(mocks.form).not.toHaveBeenCalled()
  })

  it("Query失敗時はRetryをHostへ渡しFormを作らない", async () => {
    const retry = vi.fn()
    mocks.connection.mockReturnValue({ initialPreferences: null, loading: false, retry })
    const render = vi.fn(() => null)
    await act(async () => root.render(createElement(PersonalPreferences, { render })))
    expect(render).toHaveBeenCalledWith({ status: "error", retry })
    expect(mocks.form).not.toHaveBeenCalled()
  })

  it("Query成功時だけReadyの共有FormにActionとInspectionを結合する", async () => {
    const savePreferencesAction = vi.fn()
    const inspectPreferences = vi.fn()
    mocks.connection.mockReturnValue({
      initialPreferences: defaultUserPreferences,
      loading: false,
      compact: true,
      savePreferencesAction,
      inspectPreferences,
    })
    const render = vi.fn((state: { status: string; content?: unknown }) =>
      state.content ?? null)
    // Hostがcontentを描画して初めてReadyのFormが生成される。
    await act(async () => root.render(createElement(PersonalPreferences, { render })))
    expect(render).toHaveBeenCalledWith(expect.objectContaining({ status: "ready" }))
    expect(mocks.form).toHaveBeenCalledWith(
      defaultUserPreferences,
      undefined,
      inspectPreferences,
      savePreferencesAction,
    )
  })

  it("Storyの注入Propsでは通信Connectionを使わない", async () => {
    const onSave = vi.fn()
    await act(async () => root.render(createElement(PersonalPreferences, {
      compact: false,
      initialPreferences: defaultUserPreferences,
      onSave,
    })))
    expect(mocks.connection).not.toHaveBeenCalled()
    expect(mocks.form).toHaveBeenCalledWith(
      defaultUserPreferences,
      onSave,
      undefined,
      undefined,
    )
  })
})
