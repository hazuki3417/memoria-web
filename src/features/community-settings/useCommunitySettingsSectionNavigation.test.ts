import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunitySettingsSectionNavigation } from "./useCommunitySettingsSectionNavigation"
import type { CommunitySettingsSection } from "./communitySettingsSections"

type Props = {
  section: CommunitySettingsSection
  onNavigate?: (href: string) => void
}

let navigation: ReturnType<typeof useCommunitySettingsSectionNavigation>

function Harness(props: Props) {
  navigation = useCommunitySettingsSectionNavigation(props)
  return null
}

describe("Community SettingsのNavigation State Owner", () => {
  let root: Root

  beforeEach(() => {
    root = createRoot(document.createElement("div"))
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  it("PreviewではローカルSectionを切り替え、再描画時の元Propsに戻されない", () => {
    act(() => root.render(createElement(Harness, { section: "general" })))
    expect(navigation.currentSection).toBe("general")

    act(() => navigation.onSectionChange("members", "/communities/photo-club/members"))
    expect(navigation.currentSection).toBe("members")

    act(() => root.render(createElement(Harness, { section: "general" })))
    expect(navigation.currentSection).toBe("members")
  })

  it("本番ではNavigation callbackのみ呼び出し、SectionはURL側のPropsに従う", () => {
    const onNavigate = vi.fn()
    act(() => root.render(createElement(Harness, { section: "general", onNavigate })))

    act(() => navigation.onSectionChange("members", "/communities/photo-club/members"))
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith("/communities/photo-club/members")
    expect(navigation.currentSection).toBe("general")

    act(() => root.render(createElement(Harness, { section: "members", onNavigate })))
    expect(navigation.currentSection).toBe("members")
  })
})
