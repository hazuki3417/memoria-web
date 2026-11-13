import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defaultUserPreferences } from "./userPreferences"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetchQueries: vi.fn(),
}))

vi.mock("@apollo/client", () => ({
  useApolloClient: () => ({ mutate: mocks.mutate, refetchQueries: mocks.refetchQueries }),
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

type Save = ReturnType<typeof usePersonalPreferencesSave>
let root: Root
let host: HTMLDivElement
let save!: Save

beforeEach(async () => {
  vi.resetAllMocks()
  mocks.refetchQueries.mockResolvedValue([])
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(createElement(() => {
      save = usePersonalPreferencesSave()
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
  const confirmed = { ...defaultUserPreferences, fileSizeUnit: "BINARY" as const }
  const success = {
    data: {
      updateUserPreferences: { __typename: "UpdateUserPreferencesSuccess", preferences: confirmed },
    },
  }

  it("Typed Successを返し、Refetchの失敗と区別する", async () => {
    mocks.mutate.mockResolvedValue(success)
    mocks.refetchQueries.mockRejectedValue(new Error("refetch failed"))
    await expect(save.savePreferencesAction(patch)).resolves.toEqual({
      kind: "success", value: confirmed,
    })
    expect(mocks.mutate).toHaveBeenCalledWith({
      mutation: "savePreferences",
      variables: { input: expect.objectContaining(patch) },
      errorPolicy: "all",
    })
    // 後続処理はMutationの成立を変更しない。
    expect(mocks.refetchQueries).toHaveBeenCalledTimes(1)
  })

  it("従来のSessionへの成功値を維持する", async () => {
    mocks.mutate.mockResolvedValue(success)
    await expect(save.savePreferences(patch)).resolves.toEqual(confirmed)
  })

  it("Typed ValidationはRejectedとし、既存のField Violation例外へ変換する", async () => {
    const violations = [{
      scope: "FIELD", code: "INVALID_VALUE",
      inputPaths: [{ segments: ["fileSizeUnit"] }],
    }]
    mocks.mutate.mockResolvedValue({
      data: { updateUserPreferences: { __typename: "InputValidationFailure", violations } },
    })
    await expect(save.savePreferencesAction(patch)).resolves.toMatchObject({
      kind: "rejected",
      reason: { kind: "validation", violations },
    })
    await expect(save.savePreferences(patch)).rejects.toBeInstanceOf(SettingsInputValidationError)
  })

  it("Mutationの結果欠落と通信例外はUnknownとして返す", async () => {
    mocks.mutate.mockResolvedValueOnce({ data: null })
    mocks.mutate.mockRejectedValueOnce(new Error("network"))
    await expect(save.savePreferencesAction(patch)).resolves.toEqual({ kind: "unknown" })
    await expect(save.savePreferencesAction(patch)).resolves.toEqual({ kind: "unknown" })
    expect(mocks.refetchQueries).not.toHaveBeenCalled()
  })

  it("明示的なGraphQL認可拒否をBlockedとする", async () => {
    mocks.mutate.mockResolvedValue({
      errors: [{ extensions: { code: "FORBIDDEN" } }],
    })
    await expect(save.savePreferencesAction(patch)).resolves.toMatchObject({
      kind: "rejected", reason: { kind: "blocked" },
    })
    await expect(save.savePreferences(patch)).rejects.toMatchObject({
      graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }],
    })
  })

  it("Typed Resultがある場合は併存するGraphQL Errorより優先する", async () => {
    mocks.mutate.mockResolvedValue({
      ...success, errors: [{ extensions: { code: "INTERNAL" } }],
    })
    await expect(save.savePreferencesAction(patch)).resolves.toMatchObject({
      kind: "success", value: confirmed,
    })
  })
})
