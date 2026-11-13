import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunityAliasSave } from "./useCommunityAliasSave"

const mocks = vi.hoisted(() => ({
  mutation: vi.fn(),
  query: vi.fn(),
  patch: vi.fn(),
  cache: {},
}))

vi.mock("@apollo/client", () => ({
  useApolloClient: () => ({ query: mocks.query, cache: mocks.cache }),
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  CommunityMySettingsDocument: { kind: "Document", name: "communityMySettings" },
  useUpdateCommunitySettingsMutation: () => [mocks.mutation],
}))
vi.mock("../communitySettingsCache", () => ({
  commitCommunitySettingsPatch: mocks.patch,
}))

type Actions = ReturnType<typeof useCommunityAliasSave>
let root: Root
let host: HTMLDivElement
let actions!: Actions

beforeEach(async () => {
  vi.resetAllMocks()
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(createElement(() => {
      actions = useCommunityAliasSave("community-1")
      return null
    }))
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("Community別名の保存ActionとApollo境界", () => {
  it("Aliasの確定成功だけをCacheへPatchし、Accentは含めない", async () => {
    mocks.mutation.mockResolvedValue({
      data: { updateCommunitySettings: {
        __typename: "UpdateCommunitySettingsSuccess",
        settings: { alias: "確定した別名", accentColor: "#112233" },
      } },
    })
    await expect(actions.saveAlias("確定した別名")).resolves.toEqual({
      kind: "success", value: "確定した別名",
    })
    expect(mocks.mutation).toHaveBeenCalledWith({
      fetchPolicy: "no-cache",
      errorPolicy: "all",
      variables: { input: { communityId: "community-1", alias: "確定した別名" } },
    })
    expect(mocks.patch).toHaveBeenCalledWith(mocks.cache, "community-1", { alias: "確定した別名" })
    expect(mocks.query).not.toHaveBeenCalled()
  })
  it("nullによる別名解除を確定成功としてCacheへPatchする", async () => {
    mocks.mutation.mockResolvedValue({
      data: { updateCommunitySettings: {
        __typename: "UpdateCommunitySettingsSuccess",
        settings: { alias: null, accentColor: "#112233" },
      } },
    })
    await expect(actions.saveAlias(null)).resolves.toEqual({ kind: "success", value: null })
    expect(mocks.patch).toHaveBeenCalledWith(mocks.cache, "community-1", { alias: null })
  })
  it("異なるAliasを返すMutationはUnknownとし、Cacheを変更しない", async () => {
    mocks.mutation.mockResolvedValue({
      data: { updateCommunitySettings: {
        __typename: "UpdateCommunitySettingsSuccess",
        settings: { alias: "旧別名", accentColor: "#112233" },
      } },
    })
    await expect(actions.saveAlias("新しい別名")).resolves.toEqual({ kind: "unknown" })
    expect(mocks.patch).not.toHaveBeenCalled()
  })
  it("Typed Validationを拒否として返し、Cacheを変更しない", async () => {
    mocks.mutation.mockResolvedValue({
      data: { updateCommunitySettings: {
        __typename: "InputValidationFailure",
        violations: [{ scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["alias"] }] }],
      } },
    })
    await expect(actions.saveAlias("別名")).resolves.toMatchObject({
      kind: "rejected", reason: { kind: "validation" },
    })
    expect(mocks.patch).not.toHaveBeenCalled()
  })
  it("応答欠落・通信失敗はUnknownとして返し自動再送しない", async () => {
    mocks.mutation.mockResolvedValueOnce({ data: null }).mockRejectedValueOnce(new Error("network"))
    await expect(actions.saveAlias("別名")).resolves.toEqual({ kind: "unknown" })
    await expect(actions.saveAlias("別名")).resolves.toEqual({ kind: "unknown" })
    expect(mocks.mutation).toHaveBeenCalledTimes(2)
    expect(mocks.patch).not.toHaveBeenCalled()
  })
  it("GraphQLの明示権限エラーはBlockedとし、未分類エラーはUnknownとする", async () => {
    mocks.mutation.mockResolvedValueOnce({
      errors: [{ extensions: { code: "FORBIDDEN" } }],
    }).mockResolvedValueOnce({
      errors: [{ extensions: { code: "INTERNAL" } }],
    })
    await expect(actions.saveAlias("別名")).resolves.toMatchObject({
      kind: "rejected", reason: { kind: "blocked" },
    })
    await expect(actions.saveAlias("別名")).resolves.toEqual({ kind: "unknown" })
    expect(mocks.patch).not.toHaveBeenCalled()
  })
  it("Inspectionは固定したCommunityの現在値をno-cacheで照会する", async () => {
    mocks.query.mockResolvedValue({
      data: { community: { mySettings: { alias: null } } },
    })
    await expect(actions.inspectAlias()).resolves.toBeNull()
    expect(mocks.query).toHaveBeenCalledWith({
      query: { kind: "Document", name: "communityMySettings" },
      variables: { communityId: "community-1" },
      fetchPolicy: "no-cache",
    })
    expect(mocks.patch).not.toHaveBeenCalled()
    expect(mocks.mutation).not.toHaveBeenCalled()
  })
  it("InspectionでCommunityを取得できない場合は呼出元へ失敗を返す", async () => {
    mocks.query.mockResolvedValue({ data: { community: null } })
    await expect(actions.inspectAlias()).rejects.toThrow("Community unavailable")
  })
})
