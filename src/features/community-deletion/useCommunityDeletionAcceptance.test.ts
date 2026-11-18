import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunityDeletionAcceptance } from "./useCommunityDeletionAcceptance"

const mocks = vi.hoisted(() => ({ accept: vi.fn() }))
vi.mock("@/infrastructure/graphql/generated", () => ({
  MyCommunitiesDocument: { kind: "Document", name: "myCommunities" },
  useAcceptCommunityDeletionMutation: () => [mocks.accept],
}))

let root: Root | undefined
let host: HTMLDivElement | undefined
let action!: ReturnType<typeof useCommunityDeletionAcceptance>

beforeEach(async () => {
  vi.resetAllMocks()
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root?.render(createElement(() => {
      action = useCommunityDeletionAcceptance("community-1")
      return null
    }))
  })
})
afterEach(async () => {
  if (root) await act(async () => { root?.unmount() })
  host?.remove()
  root = undefined
  host = undefined
})

describe("Community削除の既存受理Mutation契約", () => {
  it("受理成功時だけ完了し、Snapshot RevisionとMyCommunities再取得を指定する", async () => {
    mocks.accept.mockResolvedValue({ data: { acceptCommunityDeletion: { accepted: true } } })
    await expect(action.acceptDeletion("revision-1")).resolves.toBeUndefined()
    expect(mocks.accept).toHaveBeenCalledWith({
      variables: { input: { communityId: "community-1", revision: "revision-1" } },
      refetchQueries: [{ kind: "Document", name: "myCommunities" }],
      awaitRefetchQueries: true,
    })
  })

  it("未受理はACCEPTANCE_UNCONFIRMEDとして伝搬する", async () => {
    mocks.accept.mockResolvedValue({ data: { acceptCommunityDeletion: { accepted: false } } })
    await expect(action.acceptDeletion("revision-1")).rejects.toThrow("ACCEPTANCE_UNCONFIRMED")
  })

  it("Revision競合をREVIEW_CHANGEDとして伝搬する", async () => {
    mocks.accept.mockRejectedValue({
      graphQLErrors: [{ extensions: { code: "CONFLICT" } }],
    })
    await expect(action.acceptDeletion("revision-1")).rejects.toThrow("REVIEW_CHANGED")
  })

  it("通信結果不明は競合と混同せず、元のErrorを伝搬する", async () => {
    const error = new Error("network unknown")
    mocks.accept.mockRejectedValue(error)
    await expect(action.acceptDeletion("revision-1")).rejects.toBe(error)
  })
})
