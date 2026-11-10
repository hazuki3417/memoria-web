import { act, createElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CommunitySettingsStoryNavigation } from "./CommunitySettingsStoryNavigation"
import type { CommunitySettingsSection } from "../communitySettingsSections"
import type { SettingsSectionResult } from "@/ui/SettingsSectionHost"

type NavigationProps = {
  section?: CommunitySettingsSection
  onSectionChange: (section: CommunitySettingsSection) => void
  content: ReactNode
}

let rendered: NavigationProps

// Verify the Storybook adapter without mounting feature forms or Mantine UI.
vi.mock("../CommunitySettingsView", () => ({
  CommunitySettingsView: (props: NavigationProps) => {
    rendered = props
    return null
  },
}))

describe("Community Settings Storybook Navigation Adapter", () => {
  let root: Root

  beforeEach(() => {
    root = createRoot(document.createElement("div"))
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  it("Story内のSectionを切り替え、同じPropsの再描画でも維持する", () => {
    const onSectionChange = vi.fn()
    const props = { section: "general" as const, onSectionChange }
    act(() => root.render(createElement(CommunitySettingsStoryNavigation, props)))
    expect(rendered.section).toBe("general")
    expect(isValidElement(rendered.content)).toBe(true)
    const hostChildren = (rendered.content as ReactElement<{
      children: (render: (state: SettingsSectionResult) => ReactNode) => ReactNode
    }>).props.children
    const sectionContent = hostChildren((state) => state.status === "ready" ? state.content : null)
    expect((sectionContent as ReactElement<{ invitation: { invitationUrl: string } }>).props.invitation.invitationUrl).toContain("photo-club-demo-")

    act(() => rendered.onSectionChange("members"))
    expect(rendered.section).toBe("members")
    expect(onSectionChange).not.toHaveBeenCalled()

    act(() => root.render(createElement(CommunitySettingsStoryNavigation, props)))
    expect(rendered.section).toBe("members")
  })

  it("Usage固有のLoadingと共通ContextのLoadingは正しいラベルに分ける", () => {
    const props = {
      section: "usage" as const,
      loadState: "loading" as const,
      onSectionChange: vi.fn(),
    }
    act(() => root.render(createElement(CommunitySettingsStoryNavigation, props)))
    expect((rendered.content as ReactElement<{ label: string }>).props.label)
      .toBe("Community設定を読み込み中")

    act(() => root.render(createElement(CommunitySettingsStoryNavigation, {
      ...props,
      usageState: "loading",
    })))
    expect((rendered.content as ReactElement<{ label: string }>).props.label)
      .toBe("利用状況を読み込み中")
  })

  it("初期Sectionを外から受け取る", () => {
    act(() =>
      root.render(
        createElement(CommunitySettingsStoryNavigation, {
          section: "preferences",
          onSectionChange: vi.fn(),
        }),
      ),
    )
    expect(rendered.section).toBe("preferences")
    expect(isValidElement(rendered.content)).toBe(true)
  })
})
