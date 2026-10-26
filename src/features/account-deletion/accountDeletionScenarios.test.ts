import { describe, expect, it } from "vitest"
import { communitiesForScenario, labels } from "./accountDeletionScenarios"

describe("アカウント削除シナリオ", () => {
  it("Communityなしのケースでは対応・確認対象がない", () => {
    expect(communitiesForScenario("no-communities")).toEqual([])
  })

  it("Memberだけのケースは管理者の後任選択を求めない", () => {
    const items = communitiesForScenario("member-only")
    expect(items).toHaveLength(1)
    expect(items[0].relation).toBe("member")
  })

  it("最後のAdministratorで後任がいないケースを維持する", () => {
    const items = communitiesForScenario("last-administrator-no-candidate")
    expect(items).toHaveLength(1)
    expect(items[0].relation).toBe("last-administrator")
    expect(items[0].candidates).toHaveLength(0)
  })

  it("複数の最後のAdministratorを独立した候補で保持する", () => {
    const items = communitiesForScenario("multiple-last-administrators")
    expect(items).toHaveLength(3)
    expect(new Set(items.map((item) => item.id)).size).toBe(3)
  })

  it("4ステップの順序は変化させない", () => {
    expect(labels).toEqual([
      "個人データへの影響",
      "Communityへの対応",
      "Communityへの影響",
      "最終確認",
    ])
  })
})
