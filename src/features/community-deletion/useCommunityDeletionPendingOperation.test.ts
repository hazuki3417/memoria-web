import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunityDeletionPendingOperation } from "./useCommunityDeletionPendingOperation"

let root: Root | undefined
let host: HTMLDivElement | undefined
let model!: ReturnType<typeof useCommunityDeletionPendingOperation>

const mount = async () => {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  const Fixture = () => {
    model = useCommunityDeletionPendingOperation("community-1")
    return null
  }
  await act(async () => { root?.render(createElement(Fixture)) })
}

const unmount = async () => {
  if (root) await act(async () => { root?.unmount() })
  host?.remove()
  root = undefined
  host = undefined
}

beforeEach(() => {
  window.sessionStorage.clear()
  vi.stubGlobal("crypto", { randomUUID: () => "operation-fixed" })
})

afterEach(async () => {
  await unmount()
  vi.unstubAllGlobals()
  window.sessionStorage.clear()
})

describe("Community削除Operationの再Mountをまたぐ再送禁止", () => {
  it("送信前にOperation IDを永続化し、結果不明のまま再Mountしても再送できない", async () => {
    await mount()
    expect(model.status).toBe("ready")
    let operationId: string | null = null
    await act(async () => { operationId = model.begin("revision-1") })
    expect(operationId).toBe("operation-fixed")
    expect(model.operation).toEqual({ operationId: "operation-fixed", revision: "revision-1" })
    expect(model.begin("revision-1")).toBeNull()
    await act(async () => { model.markUnknown() })
    expect(model.recovering).toBe(true)
    await unmount()
    await mount()
    expect(model.recovering).toBe(true)
    expect(model.operation).toEqual({ operationId: "operation-fixed", revision: "revision-1" })
    expect(model.begin("revision-1")).toBeNull()
  })

  it("確定的な未受付のときだけ保存済みロックを解除できる", async () => {
    await mount()
    await act(async () => { model.begin("revision-1") })
    await act(async () => { model.clearRejected() })
    expect(model.operation).toBeNull()
    expect(window.sessionStorage.getItem("memoria:community-deletion:community-1")).toBeNull()
  })

  it("操作記録が破損している場合は削除を開始できない", async () => {
    window.sessionStorage.setItem("memoria:community-deletion:community-1", "invalid json")
    await mount()
    expect(model.status).toBe("unavailable")
    expect(model.begin("revision-1")).toBeNull()
  })
})
