import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defaultPersonalPreferences } from "./personalPreferences"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetchQueries: vi.fn(),
  patch: vi.fn(),
  query: vi.fn(),
}))

vi.mock("@apollo/client", () => ({
  useApolloClient: () => ({ mutate: mocks.mutate, query: mocks.query, cache: {}, refetchQueries: mocks.refetchQueries }),
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  CurrentUserDocument: "currentUser",
  PersonalSettingsAccentDocument: "personalAccent",
  PersonalSettingsPreferencesDocument: "personalPreferences",
  SaveUserPreferencesDocument: "savePreferences",
  DateFormat: { YyyyMmDd: "YYYY_MM_DD", MmDdYyyy: "MM_DD_YYYY", DdMmYyyy: "DD_MM_YYYY" },
  FileSizeUnit: { Decimal: "DECIMAL", Binary: "BINARY" },
  MediaThumbnailSize: { Small: "SMALL", Medium: "MEDIUM", Large: "LARGE" },
}))

vi.mock("./personalPreferencesCache", () => ({ commitPersonalPreferencesPatch: mocks.patch }))

type Save = ReturnType<typeof usePersonalPreferencesSave>
let root: Root
let host: HTMLDivElement
let save!: Save

beforeEach(async () => {
  vi.resetAllMocks()
  mocks.refetchQueries.mockResolvedValue([])
  mocks.patch.mockReturnValue(true)
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(createElement(() => {
      save = usePersonalPreferencesSave("user-1")
      return null
    }))
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("Personal PreferencesのAction Adapter", () => {
  const patch = { fileSizeUnit: "BINARY" as const }
  const confirmed = { ...defaultPersonalPreferences, fileSizeUnit: "BINARY" as const }
  const success = {
    data: {
      updateUserPreferences: { __typename: "UpdateUserPreferencesSuccess", preferences: confirmed },
    },
  }

  it("Typed Successを返し、Refetchの失敗と区別する", async () => {
    mocks.mutate.mockResolvedValue(success)
    mocks.patch.mockReturnValueOnce(false)
    mocks.refetchQueries.mockRejectedValue(new Error("refetch failed"))
    await expect(save.save(patch)).resolves.toEqual({
      kind: "success", value: confirmed,
    })
    expect(mocks.mutate).toHaveBeenCalledWith({
      mutation: "savePreferences",
      variables: { input: expect.objectContaining(patch) },
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    })
    // 後続処理はMutationの成立を変更しない。
    expect(mocks.patch).toHaveBeenCalledWith(expect.anything(), "user-1", patch)
    expect(mocks.refetchQueries).toHaveBeenCalledTimes(1)
  })

  it("Typed ValidationはRejectedとし、既存のField Violation例外へ変換する", async () => {
    const violations = [{
      scope: "FIELD", code: "INVALID_VALUE",
      inputPaths: [{ segments: ["fileSizeUnit"] }],
    }]
    mocks.mutate.mockResolvedValue({
      data: { updateUserPreferences: { __typename: "InputValidationFailure", violations } },
    })
    await expect(save.save(patch)).resolves.toMatchObject({
      kind: "rejected",
      reason: { kind: "validation", violations },
    })
  })

  it("Mutationの結果欠落と通信例外はUnknownとして返す", async () => {
    mocks.mutate.mockResolvedValueOnce({ data: null })
    mocks.mutate.mockRejectedValueOnce(new Error("network"))
    await expect(save.save(patch)).resolves.toEqual({ kind: "unknown" })
    await expect(save.save(patch)).resolves.toEqual({ kind: "unknown" })
    expect(mocks.refetchQueries).not.toHaveBeenCalled()
  })

  it("明示的なGraphQL認可拒否をBlockedとする", async () => {
    mocks.mutate.mockResolvedValue({
      errors: [{ extensions: { code: "FORBIDDEN" } }],
    })
    await expect(save.save(patch)).resolves.toMatchObject({
      kind: "rejected", reason: { kind: "blocked" },
    })
  })

  it("Typed Resultがある場合は併存するGraphQL Errorより優先する", async () => {
    mocks.mutate.mockResolvedValue({
      ...success, errors: [{ extensions: { code: "INTERNAL" } }],
    })
    await expect(save.save(patch)).resolves.toMatchObject({
      kind: "success", value: confirmed,
    })
  })
})
