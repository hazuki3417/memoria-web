import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { useCommunityNameAction } from "./useCommunityNameAction"

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

type Actions = ReturnType<typeof useCommunityNameAction>
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
        actions = useCommunityNameAction("community-1")
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
  it("Community名変更の成功は確定名を返し、MyCommunitiesの再取得を要求する", async () => {
    mocks.rename.mockResolvedValue({
      data: {
        updateCommunity: {
          __typename: "UpdateCommunitySuccess",
          community: { id: "community-1", name: "新しい名前" },
        },
      },
    })
    expect(await actions.onSaveName("新しい名前")).toBe("新しい名前")
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

  it("Community名変更の応答欠落と通信失敗をFormに伝搬し、接続層から重複通知しない", async () => {
    mocks.rename
      .mockResolvedValueOnce({ data: null })
      .mockRejectedValueOnce(new Error("network"))
    await expect(actions.onSaveName("変更")).rejects.toThrow("Settings mutation outcome unavailable")
    await expect(actions.onSaveName("変更")).rejects.toThrow("network")
    expect(mocks.notify).not.toHaveBeenCalled()
  })

  it("Community名のTyped ValidationをField Path付きでFormへ伝達する", async () => {
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
    await expect(actions.onSaveName("変更")).rejects.toMatchObject({
      kind: "validation",
      violations: [{ code: "REQUIRED" }],
    })
    expect(mocks.notify).not.toHaveBeenCalled()
  })

})
