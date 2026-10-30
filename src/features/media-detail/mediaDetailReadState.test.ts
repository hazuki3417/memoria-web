import { describe, expect, it } from "vitest"
import {
  projectCollection,
  projectMediaDetail,
  projectPreview,
  nextProcessingPollFailures,
  processingPollDelay,
  mediaDetailPollingIdentity,
  type DetailRecord,
} from "./mediaDetailReadState"

const media: DetailRecord = {
  id: "a",
  originalFileName: "example.jpg",
  fileSize: 1200,
  uploadedAt: "2026-10-01T00:00:00Z",
  uploadedBy: { nickname: "User", deleted: false },
  processing: { status: "READY" },
  image: {
    width: 1600,
    height: 900,
    variants: [
      { width: 480, height: 270, url: "small" },
      { width: 1600, height: 900, url: "large" },
    ],
  },
  groups: { edges: [], pageInfo: { hasNextPage: false } },
  tags: { edges: [{ node: { id: "t1", name: "Travel" } }], pageInfo: { hasNextPage: false } },
}
describe("Media detail read state", () => {
  it("does not present previous media for a newly selected ID", () => {
    expect(projectMediaDetail("b", false, { media }, false)).toEqual({ kind: "loading" })
    expect(projectMediaDetail("b", true, { media }, false)).toEqual({ kind: "loading" })
  })
  it("distinguishes pending, essential error, unavailable and ready", () => {
    expect(projectMediaDetail("a", true, undefined, false)).toEqual({ kind: "loading" })
    expect(projectMediaDetail("a", false, undefined, true)).toEqual({ kind: "retryable-error" })
    expect(projectMediaDetail("a", false, { media: null }, false)).toEqual({ kind: "unavailable" })
    expect(projectMediaDetail("a", false, { media }, false)).toEqual({ kind: "ready", media })
  })
  it("never treats READY without a usable variant as an image success", () => {
    expect(projectPreview({ kind: "ready", media })).toEqual({
      kind: "ready", url: "large", width: 1600, height: 900,
    })
    expect(projectPreview({ kind: "ready", media: { ...media, image: { width: 1, height: 1, variants: [] } } }).kind).toBe("delivery-error")
    expect(projectPreview({ kind: "ready", media: { ...media, processing: null } }).kind).toBe("delivery-error")
    expect(projectPreview({ kind: "ready", media: { ...media, processing: { status: "PROCESSING" } } }).kind).toBe("processing")
    expect(projectPreview({ kind: "ready", media: { ...media, processing: { status: "FAILED" } } }).kind).toBe("processing-failed")
  })
  it("distinguishes confirmed empty, incomplete, and section error", () => {
    const detail = { kind: "ready" as const, media }
    expect(projectCollection(detail, "groups", false)).toEqual({ kind: "ready", values: [] })
    expect(projectCollection(detail, "tags", false)).toEqual({
      kind: "ready", values: [{ id: "t1", name: "Travel" }],
    })
    expect(projectCollection(detail, "groups", true).kind).toBe("error")
    expect(projectCollection({ kind: "ready", media: { ...media, tags: null } }, "tags", false).kind).toBe("error")
    expect(projectCollection({ kind: "ready", media: { ...media, groups: { edges: [], pageInfo: { hasNextPage: true } } } }, "groups", false).kind).toBe("incomplete")
    expect(projectCollection({ kind: "loading" }, "groups", false).kind).toBe("pending")
  })
})

describe("processing polling contract", () => {
  it("uses normal 5s / transport retry 10s, and stops on the third failure", () => {
    expect(processingPollDelay(0)).toBe(5000)
    const one = nextProcessingPollFailures(0, true)
    expect(one).toBe(1)
    expect(processingPollDelay(one)).toBe(10000)
    const two = nextProcessingPollFailures(one, true)
    expect(two).toBe(2)
    expect(processingPollDelay(two)).toBe(10000)
    const three = nextProcessingPollFailures(two, true)
    expect(three).toBe(3)
    expect(processingPollDelay(three)).toBeNull()
    expect(nextProcessingPollFailures(two, false)).toBe(0)
  })
})


describe("processing polling identity", () => {
  it("separates media and scope without retaining prior failure state", () => {
    const personal = mediaDetailPollingIdentity("media-a", { type: "PERSONAL" })
    const community = mediaDetailPollingIdentity("media-a", { type: "COMMUNITY", communityId: "community-1" })
    expect(personal).not.toBe(community)
    expect(community).not.toBe(mediaDetailPollingIdentity("media-a", { type: "COMMUNITY", communityId: "community-2" }))
    expect(community).not.toBe(mediaDetailPollingIdentity("media-b", { type: "COMMUNITY", communityId: "community-1" }))
    expect(personal).toBe(mediaDetailPollingIdentity("media-a", { type: "PERSONAL" }))
    expect(mediaDetailPollingIdentity(null, { type: "PERSONAL" })).toBeNull()
  })
  it("does not permit delimiter collisions in IDs", () => {
    expect(mediaDetailPollingIdentity("a:b", { type: "COMMUNITY", communityId: "c" }))
      .not.toBe(mediaDetailPollingIdentity("a", { type: "COMMUNITY", communityId: "b:c" }))
  })
})
