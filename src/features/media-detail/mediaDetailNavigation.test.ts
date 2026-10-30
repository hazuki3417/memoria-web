import { describe, expect, it } from "vitest"
import {
  createMediaNavigationSnapshot,
  getMediaDetailId,
  getMediaNavigation,
  isMediaDetailRoute,
  mediaDetailUrl,
} from "./mediaDetailNavigation"

const origin = {
  pathname: "/media",
  searchWithoutMediaId: "?tag=travel",
  hash: "#gallery",
}

describe("Media Detail URL contract", () => {
  it("adds or replaces only mediaId while preserving other query and fragment", () => {
    expect(
      mediaDetailUrl("/media", "?tag=a&mediaId=old&tag=b", "#foo", "next"),
    ).toBe("/media?tag=a&tag=b&mediaId=next#foo")
    expect(mediaDetailUrl("/media", "?tag=a&mediaId=old", "#foo", null)).toBe(
      "/media?tag=a#foo",
    )
  })
  it("ignores missing, repeated, or invalid selected identifiers", () => {
    expect(getMediaDetailId("?mediaId=id")).toBe("id")
    expect(getMediaDetailId("?tag=x")).toBeNull()
    expect(getMediaDetailId("?mediaId=a&mediaId=b")).toBeNull()
    expect(getMediaDetailId("?mediaId=%20")).toBeNull()
    expect(getMediaDetailId("?mediaId=%20id")).toBeNull()
  })
  it("supports only intended application screen routes", () => {
    expect(isMediaDetailRoute("/media")).toBe(true)
    expect(isMediaDetailRoute("/communities/abc/groups")).toBe(true)
    expect(isMediaDetailRoute("/dashboard")).toBe(true)
    expect(isMediaDetailRoute("/settings/profile")).toBe(false)
    expect(isMediaDetailRoute("/communities/abc/settings")).toBe(false)
  })
})

describe("Media navigation immutable snapshot", () => {
  it("keeps loaded order and immutable inputs, with end boundaries", () => {
    const ids = ["a", "b", "c"]
    const snapshot = createMediaNavigationSnapshot(ids, "b", origin)
    ids.push("d")
    expect(snapshot.ids).toEqual(["a", "b", "c"])
    expect(getMediaNavigation(snapshot, "b", false)).toEqual({
      position: 1,
      count: 3,
      previousId: "a",
      nextId: "c",
    })
    expect(getMediaNavigation(snapshot, "a", false).previousId).toBeNull()
    expect(getMediaNavigation(snapshot, "c", false).nextId).toBeNull()
    expect(getMediaNavigation(snapshot, "c", true).nextId).toBe("a")
    expect(getMediaNavigation(snapshot, "a", true).previousId).toBe("c")
  })
  it("disallows repeated IDs, absent selected IDs and empty inputs", () => {
    expect(() =>
      createMediaNavigationSnapshot(["a", "a"], "a", origin),
    ).toThrow()
    expect(() => createMediaNavigationSnapshot(["a"], "b", origin)).toThrow()
    expect(() => createMediaNavigationSnapshot([""], "", origin)).toThrow()
  })
  it("does not invent adjacent items for direct URL or missing snapshot ID", () => {
    const snapshot = createMediaNavigationSnapshot(["a"], "a", origin)
    expect(getMediaNavigation(null, "a", true).count).toBeNull()
    expect(getMediaNavigation(snapshot, "a", true).nextId).toBeNull()
    expect(getMediaNavigation(snapshot, "unknown", true).nextId).toBeNull()
  })
})
