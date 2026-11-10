import { act, createElement, useEffect, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SettingsSectionHost, type SettingsSectionRender } from "./SettingsSectionHost"

vi.mock("@/components/SettingsContentStatus/SettingsContentStatus", () => ({
  SettingsContentStatus: ({
    state,
    onRetry,
    children,
  }: {
    state: string
    onRetry?: () => void
    children: ReactNode
  }) =>
    createElement(
      "div",
      { "data-state": state },
      state === "ready" ? children : null,
      state === "error" && onRetry
        ? createElement("button", { onClick: onRetry }, "再試行")
        : null,
    ),
}))

describe("SettingsSectionHost", () => {
  let root: Root
  let element: HTMLDivElement

  beforeEach(() => {
    element = document.createElement("div")
    root = createRoot(element)
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  it("keeps the controller mounted while its ready-only content is hidden", () => {
    let mounted = 0
    function Controller({
      render,
      status,
    }: {
      render: SettingsSectionRender
      status: "loading" | "ready"
    }) {
      useEffect(() => {
        mounted += 1
      }, [])
      return render(
        status === "ready"
          ? { status: "ready", content: createElement("span", null, "Profile UI") }
          : { status: "loading" },
      )
    }

    const show = (status: "loading" | "ready") => {
      act(() =>
        root.render(
          createElement(
            SettingsSectionHost,
            { label: "読み込み中" },
            (render: SettingsSectionRender) => createElement(Controller, { render, status }),
          ),
        ),
      )
    }

    show("loading")
    expect(element.querySelector('[data-state="loading"]')).not.toBeNull()
    expect(element.textContent).not.toContain("Profile UI")
    show("ready")
    expect(element.querySelector('[data-state="ready"]')).not.toBeNull()
    expect(element.textContent).toContain("Profile UI")
    expect(mounted).toBe(1)
  })

  it("passes one retry action to the common status UI", () => {
    const retry = vi.fn()
    act(() =>
      root.render(
        createElement(
          SettingsSectionHost,
          { label: "読み込み中" },
          (render: SettingsSectionRender) => render({ status: "error", retry }),
        ),
      ),
    )
    expect(element.querySelector('[data-state="error"]')).not.toBeNull()
    act(() => element.querySelector("button")?.click())
    expect(retry).toHaveBeenCalledTimes(1)
  })
})
