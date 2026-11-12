import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { usePersonalProfileSave } from "./usePersonalProfileSave"

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetchQueries: vi.fn(),
}))

vi.mock("@apollo/client", () => ({
  useApolloClient: () => ({ refetchQueries: mocks.refetchQueries }),
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  CurrentUserDocument: { kind: "Document", name: "CurrentUser" },
  PersonalSettingsProfileDocument: { kind: "Document", name: "PersonalSettingsProfile" },
  useUpdateMemoriaUserProfileMutation: () => [mocks.mutate],
}))

type SaveAction = ReturnType<typeof usePersonalProfileSave>
let root: Root
let host: HTMLDivElement
let action!: SaveAction

beforeEach(async () => {
  vi.resetAllMocks()
  mocks.refetchQueries.mockResolvedValue(undefined)
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(createElement(() => {
      action = usePersonalProfileSave()
      return null
    }))
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("Profile保存ActionのMutation結果", () => {
  it("Mutation確定名をFormへ渡し、確認後の再取得を開始する", async () => {
    mocks.mutate.mockResolvedValue({
      data: {
        updateUserProfile: {
          __typename: "UpdateUserProfileSuccess",
          user: { profile: { nickname: "Serverの確定名" } },
        },
      },
    })
    await expect(action.saveProfile("送信した名前")).resolves.toEqual({
      status: "confirmed",
      value: "Serverの確定名",
    })
    expect(mocks.mutate).toHaveBeenCalledWith(expect.objectContaining({
      variables: { input: { nickname: "送信した名前" } },
      errorPolicy: "all",
    }))
    expect(mocks.refetchQueries).toHaveBeenCalledTimes(1)
  })

  it("Mutation確定後の再取得失敗でも保存成功を取り消さない", async () => {
    mocks.mutate.mockResolvedValue({
      data: {
        updateUserProfile: {
          __typename: "UpdateUserProfileSuccess",
          user: { profile: { nickname: "確定した名前" } },
        },
      },
    })
    mocks.refetchQueries.mockRejectedValue(new Error("refresh failed"))
    await expect(action.saveProfile("送信した名前")).resolves.toEqual({
      status: "confirmed",
      value: "確定した名前",
    })
    expect(mocks.mutate).toHaveBeenCalledTimes(1)
    expect(mocks.refetchQueries).toHaveBeenCalledTimes(1)
  })

  it("型付き入力拒否はValidationとして返し、再取得しない", async () => {
    const violations = [
      { scope: "FIELD", code: "REQUIRED", inputPaths: [{ segments: ["nickname"] }] },
    ]
    mocks.mutate.mockResolvedValue({
      data: { updateUserProfile: { __typename: "InputValidationFailure", violations } },
    })
    await expect(action.saveProfile("名前")).resolves.toEqual({
      status: "validation",
      violations,
    })
    expect(mocks.refetchQueries).not.toHaveBeenCalled()
  })

  it("Mutation結果が欠落した場合はUnknownとして返す", async () => {
    mocks.mutate.mockResolvedValue({ data: null })
    await expect(action.saveProfile("名前")).resolves.toEqual({ status: "unknown" })
    expect(mocks.refetchQueries).not.toHaveBeenCalled()
  })
})
