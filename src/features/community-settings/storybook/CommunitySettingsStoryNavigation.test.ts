import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CommunitySettingsStoryNavigation } from "./CommunitySettingsStoryNavigation"
import type { CommunitySettingsSection } from "../communitySettingsSections"

type NavigationProps = {
  section?: CommunitySettingsSection
  onSectionChange: (section: CommunitySettingsSection, href: string) => void
  preferencesContent?: unknown
  invitation?: { invitationUrl: string }
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

    act(() => rendered.onSectionChange("members", "/communities/photo-club/members"))
    expect(rendered.section).toBe("members")
    expect(onSectionChange).not.toHaveBeenCalled()

    act(() => root.render(createElement(CommunitySettingsStoryNavigation, props)))
    expect(rendered.section).toBe("members")
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
    expect(rendered.preferencesContent).toBeTruthy()
    expect(rendered.invitation?.invitationUrl).toContain("photo-club-demo-")
  })
})
