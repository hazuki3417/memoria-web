import { describe, expect, it } from "vitest"
import { toDesiredMediaTags } from "./mediaTagApi"

describe("toDesiredMediaTags", () => {
  it("reuses scoped persisted IDs and leaves unknown names for backend creation", () => {
    expect(
      toDesiredMediaTags(
        ["旅行", "　風景　", "旅行"],
        [{ id: "existing", name: "旅行" }],
      ),
    ).toEqual([{ id: "existing", name: "旅行" }, { name: "風景" }])
  })
  it("does not collapse differently cased names", () => {
    expect(toDesiredMediaTags(["Trip", "trip"], [])).toEqual([
      { name: "Trip" },
      { name: "trip" },
    ])
  })
  it("removes blank drafts", () => {
    expect(toDesiredMediaTags(["", "　"], [])).toEqual([])
  })
})
