import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { useCommunityNameSave } from "./useCommunityNameSave"

const mocks = vi.hoisted(() => ({
  rename: vi.fn(),
  notify: vi.fn(),
}))

vi.mock("@/components/Feedback", () => ({
  showNotification: mocks.notify,
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  MyCommunitiesDocument: { kind: "Document", name: "myCommunities" },
  useUpdateCommunityMutation: () => [mocks.rename],
}))

type Actions = ReturnType<typeof useCommunityNameSave>
let root: Root
let host: HTMLDivElement
let actions!: Actions

beforeEach(async () => {
  vi.resetAllMocks()
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root.render(
      createElement(() => {
        actions = useCommunityNameSave("community-1")
        return null
      }),
    )
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe("Community名のMutation契約", () => {
  it("Community名の保存成功は確定名を返し、MyCommunitiesを更新する", async () => {
    mocks.rename.mockResolvedValue({
      data: {
        updateCommunity: {
          __typename: "UpdateCommunitySuccess",
          community: { id: "community-1", name: "新しい名前" },
        },
      },
    })
    expect(await actions.onSaveName("新しい名前")).toEqual({ kind: "success", value: "新しい名前" })
    expect(mocks.rename).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: { communityId: "community-1", name: "新しい名前" },
        },
        awaitRefetchQueries: false,
      }),
    )
    expect(mocks.rename.mock.calls[0][0].refetchQueries).toHaveLength(1)
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("Community名変更の応答欠落と通信失敗は結果不明として返し、自動再送しない", async () => {
    mocks.rename
      .mockResolvedValueOnce({ data: null })
      .mockRejectedValueOnce(new Error("network"))
    await expect(actions.onSaveName("変更")).resolves.toEqual({ kind: "unknown" })
    await expect(actions.onSaveName("変更")).resolves.toEqual({ kind: "unknown" })
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("Community名のTyped Validationを拒否理由とField Path付きで伝える", async () => {
    mocks.rename.mockResolvedValue({
      data: {
        updateCommunity: {
          __typename: "InputValidationFailure",
          violations: [{
            scope: "FIELD", code: "REQUIRED", inputPaths: [{ segments: ["name"] }],
          }],
        },
      },
    })
    await expect(actions.onSaveName("変更")).resolves.toMatchObject({
      kind: "rejected",
      reason: { kind: "validation", violations: [{ code: "REQUIRED" }] },
    })
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("GraphQLの権限エラーは自動再送できないBlockedとして返す", async () => {
    const error = { extensions: { code: "FORBIDDEN" }, message: "Not authorized" }
    mocks.rename.mockResolvedValue({ errors: [error] })
    await expect(actions.onSaveName("変更")).resolves.toMatchObject({
      kind: "rejected",
      reason: { kind: "blocked" },
    })
    expect(mocks.rename).toHaveBeenCalledTimes(1)
  })

  it("未認識のGraphQLエラーは結果不明として扱う", async () => {
    mocks.rename.mockResolvedValue({
      errors: [{ extensions: { code: "INTERNAL" } }],
    })
    await expect(actions.onSaveName("変更")).resolves.toEqual({ kind: "unknown" })
    expect(mocks.rename).toHaveBeenCalledTimes(1)
  })
})
