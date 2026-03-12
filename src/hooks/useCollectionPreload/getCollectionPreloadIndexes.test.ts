import { describe, expect, it } from "vitest"
import { getCollectionPreloadIndexes } from "./getCollectionPreloadIndexes"

describe("getCollectionPreloadIndexes", () => {
  it("returns next and prev indexes", () => {
    const result = getCollectionPreloadIndexes({
      length: 5,
      index: 2,
      distance: 1,
      loop: false,
    })

    expect(result).toEqual([3, 1])
  })

  it("handles loop", () => {
    const result = getCollectionPreloadIndexes({
      length: 5,
      index: 0,
      distance: 1,
      loop: true,
    })

    expect(result).toEqual([1, 4])
  })
})
