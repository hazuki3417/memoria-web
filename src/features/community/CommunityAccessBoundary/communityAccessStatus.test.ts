import { describe, expect, it } from "vitest"
import { getCommunityAccessStatus } from "./communityAccessStatus"

const id = "community-a"
const ready = { community: { id } }
const input = (overrides: Partial<Parameters<typeof getCommunityAccessStatus>[0]> = {}) => ({
  loading: false,
  error: null,
  communityId: id,
  result: ready,
  ...overrides,
})

const graphError = (code: string) => ({
  graphQLErrors: [{ extensions: { code } }],
})

describe("getCommunityAccessStatus", () => {
  it("never mounts pages while a network verification is in progress", () => {
    expect(getCommunityAccessStatus(input({ loading: true }))).toBe("loading")
    expect(
      getCommunityAccessStatus(
        input({ loading: true, error: graphError("NOT_FOUND") }),
      ),
    ).toBe("loading")
  })

  it("accepts a verified Community only for the requested ID", () => {
    expect(getCommunityAccessStatus(input())).toBe("ready")
    expect(
      getCommunityAccessStatus(input({ result: { community: { id: "other" } } })),
    ).toBe("error")
  })

  it("hides missing or inaccessible Communities without distinguishing them", () => {
    expect(
      getCommunityAccessStatus(input({ result: { community: null } })),
    ).toBe("unavailable")
    expect(
      getCommunityAccessStatus(input({ error: graphError("NOT_FOUND") })),
    ).toBe("unavailable")
    expect(
      getCommunityAccessStatus(input({ error: graphError("FORBIDDEN") })),
    ).toBe("unavailable")
  })

  it("does not confuse network, incomplete, and mixed failures with nonmembership", () => {
    expect(getCommunityAccessStatus(input({ error: new Error("offline") }))).toBe("error")
    expect(getCommunityAccessStatus(input({ result: undefined }))).toBe("error")
    expect(
      getCommunityAccessStatus(
        input({
          error: {
            graphQLErrors: [
              { extensions: { code: "NOT_FOUND" } },
              { extensions: { code: "INTERNAL" } },
            ],
          },
        }),
      ),
    ).toBe("error")
    expect(
      getCommunityAccessStatus(input({ error: graphError("INTERNAL") })),
    ).toBe("error")
  })

  it("distinguishes session expiry from ordinary retrieval failure", () => {
    expect(
      getCommunityAccessStatus(input({ error: graphError("UNAUTHENTICATED") })),
    ).toBe("unauthenticated")
  })
})
