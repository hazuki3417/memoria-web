import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunityDeletionAcceptance } from "./useCommunityDeletionAcceptance"

const mocks = vi.hoisted(() => ({ accept: vi.fn(), refetch: vi.fn() }))
vi.mock("@apollo/client", () => ({
  useApolloClient: () => ({ refetchQueries: mocks.refetch }),
}))
vi.mock("@/infrastructure/graphql/generated", () => ({
  MyCommunitiesDocument: { kind: "Document", name: "myCommunities" },
  useAcceptCommunityDeletionMutation: () => [mocks.accept],
}))

let root: Root | undefined
let host: HTMLDivElement | undefined
let action!: ReturnType<typeof useCommunityDeletionAcceptance>

beforeEach(async () => {
  vi.resetAllMocks()
  mocks.refetch.mockResolvedValue([])
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

describe("Community削除受付の確定結果と後続同期の独立契約", () => {
  it("受付確定後にだけ独立Refetchを実行し、Revisionを維持する", async () => {
    mocks.accept.mockResolvedValue({ data: { acceptCommunityDeletion: { accepted: true } } })
    await expect(action.acceptDeletion("revision-1")).resolves.toEqual({
      kind: "accepted", sync: "succeeded",
    })
    expect(mocks.accept).toHaveBeenCalledWith({
      variables: { input: { communityId: "community-1", revision: "revision-1" } },
    })
    expect(mocks.refetch).toHaveBeenCalledWith({
      include: [{ kind: "Document", name: "myCommunities" }],
    })
  })

  it("受付確定後のRefetch拒否は受付成功を取り消さず、削除を再送しない", async () => {
    mocks.accept.mockResolvedValue({ data: { acceptCommunityDeletion: { accepted: true } } })
    mocks.refetch.mockRejectedValue(new Error("refetch failed"))
    await expect(action.acceptDeletion("revision-1")).resolves.toEqual({
      kind: "accepted", sync: "failed",
    })
    expect(mocks.accept).toHaveBeenCalledTimes(1)
  })

  it("Refetch結果のGraphQL Errorでも同期失敗として分離する", async () => {
    mocks.accept.mockResolvedValue({ data: { acceptCommunityDeletion: { accepted: true } } })
    mocks.refetch.mockResolvedValue([{ errors: [{ message: "unavailable" }] }])
    await expect(action.acceptDeletion("revision-1")).resolves.toEqual({
      kind: "accepted", sync: "failed",
    })
    expect(mocks.accept).toHaveBeenCalledTimes(1)
  })

  it("accepted falseは明示的な未受付として成功・同期を行わない", async () => {
    mocks.accept.mockResolvedValue({ data: { acceptCommunityDeletion: { accepted: false } } })
    await expect(action.acceptDeletion("revision-1")).resolves.toEqual({ kind: "not-accepted" })
    expect(mocks.refetch).not.toHaveBeenCalled()
  })

  it("Result欠落は受付不明として送信を繰り返さない", async () => {
    mocks.accept.mockResolvedValue({ data: { acceptCommunityDeletion: null } })
    await expect(action.acceptDeletion("revision-1")).resolves.toEqual({ kind: "unknown" })
    expect(mocks.accept).toHaveBeenCalledTimes(1)
    expect(mocks.refetch).not.toHaveBeenCalled()
  })

  it("Revision競合を再確認が必要な結果として区別する", async () => {
    mocks.accept.mockRejectedValue({
      graphQLErrors: [{ extensions: { code: "CONFLICT" } }],
    })
    await expect(action.acceptDeletion("revision-1")).resolves.toEqual({ kind: "review-changed" })
    expect(mocks.refetch).not.toHaveBeenCalled()
  })

  it("通信結果不明を成功と断定せず、再送しない", async () => {
    mocks.accept.mockRejectedValue(new Error("network unknown"))
    await expect(action.acceptDeletion("revision-1")).resolves.toEqual({ kind: "unknown" })
    expect(mocks.accept).toHaveBeenCalledTimes(1)
    expect(mocks.refetch).not.toHaveBeenCalled()
  })

  it("Mutation受付確定前にRefetchを開始しない", async () => {
    let resolve!: (value: unknown) => void
    mocks.accept.mockReturnValue(new Promise((done) => { resolve = done }))
    const attempt = action.acceptDeletion("revision-1")
    expect(mocks.refetch).not.toHaveBeenCalled()
    resolve({ data: { acceptCommunityDeletion: { accepted: true } } })
    await expect(attempt).resolves.toEqual({ kind: "accepted", sync: "succeeded" })
    expect(mocks.refetch).toHaveBeenCalledTimes(1)
  })
})
