import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunityPreferencesSave } from "./useCommunityPreferencesSave"

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  query: vi.fn(),
  patch: vi.fn(),
  refetchQueries: vi.fn(),
  cache: {},
}))

vi.mock("@apollo/client", () => ({
  useApolloClient: () => ({
    mutate: mocks.mutate, query: mocks.query,
    cache: mocks.cache, refetchQueries: mocks.refetchQueries,
  }),
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  CommunityMySettingsDocument: "communityMySettings",
  MyCommunitiesDocument: "myCommunities",
  UpdateCommunitySettingsDocument: "updateCommunitySettings",
}))
vi.mock("./communityPreferencesCache", () => ({
  commitCommunitySettingsPatch: mocks.patch,
}))

type Operations = ReturnType<typeof useCommunityPreferencesSave>
let root: Root
let host: HTMLDivElement
let operations: Operations

beforeEach(async () => {
  vi.resetAllMocks()
  mocks.refetchQueries.mockResolvedValue([])
  mocks.patch.mockReturnValue(true)
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(createElement(() => {
      operations = useCommunityPreferencesSave("community-1")
      return null
    }))
  })
})

afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("Community Preferencesの保存Adapter", () => {
  const patch = { accentColor: "#AABBCC" }
  const success = {
    data: { updateCommunitySettings: {
      __typename: "UpdateCommunitySettingsSuccess",
      settings: { accentColor: "#aabbcc", alias: "古い別名" },
    } },
  }

  it("確定済みのAccentのみを対象CommunityのCacheへ反映し、Aliasを含めない", async () => {
    mocks.mutate.mockResolvedValue(success)
    await expect(operations.save(patch)).resolves.toEqual({ kind: "success", value: patch })
    expect(mocks.mutate).toHaveBeenCalledWith({
      mutation: "updateCommunitySettings", fetchPolicy: "no-cache", errorPolicy: "all",
      variables: { input: { communityId: "community-1", ...patch } },
    })
    expect(mocks.patch).toHaveBeenCalledWith(mocks.cache, "community-1", patch)
    expect(mocks.query).not.toHaveBeenCalled()
  })

  it("確定SuccessはCache同期・Refetchの失敗によってUnknownへ変わらない", async () => {
    mocks.mutate.mockResolvedValue(success)
    mocks.patch.mockImplementationOnce(() => { throw new Error("cache failure") })
    mocks.refetchQueries.mockRejectedValueOnce(new Error("refetch failure"))
    await expect(operations.save(patch)).resolves.toEqual({ kind: "success", value: patch })
    expect(mocks.refetchQueries).toHaveBeenCalledWith({ include: ["communityMySettings", "myCommunities"], onQueryUpdated: expect.any(Function) })
  })

  it("Cache欠落時は一覧と対象CommunityだけをRefetchする", () => {
    mocks.patch.mockReturnValueOnce(false)
    operations.confirm(patch)
    expect(mocks.refetchQueries).toHaveBeenCalledTimes(1)
    const { onQueryUpdated } = mocks.refetchQueries.mock.calls[0][0]
    const result = Promise.resolve({})
    const refetch = vi.fn().mockReturnValue(result)

    expect(onQueryUpdated({ variables: undefined, refetch })).toBe(result)
    expect(onQueryUpdated({ variables: {}, refetch })).toBe(result)
    expect(onQueryUpdated({ variables: { communityId: "community-1" }, refetch })).toBe(result)
    expect(onQueryUpdated({ variables: { communityId: "community-2" }, refetch })).toBe(false)
    expect(refetch).toHaveBeenCalledTimes(3)
  })

  it("Typed Successが併存するGraphQL Errorより優先される", async () => {
    mocks.mutate.mockResolvedValue({ ...success, errors: [{ extensions: { code: "INTERNAL" } }] })
    await expect(operations.save(patch)).resolves.toEqual({ kind: "success", value: patch })
  })

  it("Typed ValidationはViolation付きのRejectedを返す", async () => {
    const violations = [{ scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] }]
    mocks.mutate.mockResolvedValue({ data: { updateCommunitySettings: {
      __typename: "InputValidationFailure", violations,
    } } })
    await expect(operations.save(patch)).resolves.toEqual({
      kind: "rejected", reason: { kind: "validation", violations },
    })
    expect(mocks.patch).not.toHaveBeenCalled()
  })

  it("明示的な認可拒否をBlocked、応答欠落・通信失敗・無効色をUnknownとする", async () => {
    mocks.mutate
      .mockResolvedValueOnce({ errors: [{ extensions: { code: "FORBIDDEN" } }] })
      .mockResolvedValueOnce({ data: null })
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ data: { updateCommunitySettings: {
        __typename: "UpdateCommunitySettingsSuccess", settings: { accentColor: "#123" },
      } } })
    await expect(operations.save(patch)).resolves.toMatchObject({ kind: "rejected", reason: { kind: "blocked" } })
    for (let i = 0; i < 3; i += 1) {
      await expect(operations.save(patch)).resolves.toEqual({ kind: "unknown" })
    }
    expect(mocks.patch).not.toHaveBeenCalled()
  })

  it("現在値照会はno-cacheで行い、明示確認までCacheを変更しない", async () => {
    mocks.query.mockResolvedValue({ data: { community: { id: "community-1", mySettings: { ...patch, alias: "別名" } } } })
    await expect(operations.observe()).resolves.toEqual(patch)
    expect(mocks.query).toHaveBeenCalledWith({
      query: "communityMySettings", variables: { communityId: "community-1" }, fetchPolicy: "no-cache", context: { settingsInspection: true, queryDeduplication: false },
    })
    expect(mocks.patch).not.toHaveBeenCalled()
    operations.confirm(patch)
    expect(mocks.patch).toHaveBeenCalledWith(mocks.cache, "community-1", patch)
    expect(mocks.mutate).not.toHaveBeenCalled()
  })

  it("別Communityの照会結果を採用しない", async () => {
    mocks.query.mockResolvedValue({ data: { community: { id: "community-2", mySettings: { ...patch, alias: null } } } })
    await expect(operations.observe()).rejects.toThrow("Community accent unavailable")
    expect(mocks.patch).not.toHaveBeenCalled()
  })

  it("Communityを取得できない場合は現在値照会の失敗を返す", async () => {
    mocks.query.mockResolvedValue({ data: { community: null } })
    await expect(operations.observe()).rejects.toThrow("Community accent unavailable")
    expect(mocks.patch).not.toHaveBeenCalled()
  })
  it("Typed Violationのない明示Validation拒否はField Errorを推測しない", async () => {
    mocks.mutate.mockResolvedValue({ errors: [{ extensions: { code: "VALIDATION" } }] })
    await expect(operations.save(patch)).resolves.toEqual({
      kind: "rejected", reason: { kind: "validation", violations: null },
    })
    expect(mocks.patch).not.toHaveBeenCalled()
  })

})
