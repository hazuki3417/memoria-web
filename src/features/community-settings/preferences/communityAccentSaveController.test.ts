import { describe, expect, it, vi } from "vitest"
import { SettingsInputValidationError } from "@/infrastructure/graphql/settingsMutationResult"
import { createCommunityAccentSaveController } from "./communityAccentSaveController"

const id = "community-1"
const tick = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe("session Community Accent save controller", () => {
  it("preserves the draft and status after view listeners unmount", async () => {
    const controller = createCommunityAccentSaveController()
    const save = vi.fn().mockResolvedValue("#ABCDEF")
    const subscriber = vi.fn()
    const confirm = vi.fn()
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn().mockResolvedValue("#ABCDEF"),
      confirm,
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    const unsubscribe = controller.subscribe(id, subscriber)
    controller.edit(id, "#ABCDEF")
    unsubscribe()
    await tick()
    expect(save).toHaveBeenCalledWith("#ABCDEF")
    expect(controller.getSnapshot(id)).toMatchObject({
      confirmed: "#ABCDEF",
      draft: "#ABCDEF",
      status: "saved",
    })
  })

  it("preserves an incomplete draft and does not send it", async () => {
    const controller = createCommunityAccentSaveController()
    const save = vi.fn()
    controller.initialize(id, "#112233")
    controller.edit(id, "#123")
    await tick()
    expect(save).not.toHaveBeenCalled()
    expect(controller.getSnapshot(id)).toMatchObject({
      confirmed: "#112233",
      draft: "#123",
      status: "pending",
    })
  })

  it("does not save a superseded queued color after a newer HEX draft becomes incomplete", async () => {
    const controller = createCommunityAccentSaveController()
    let resolveFirst: ((value: string) => void) | undefined
    const save = vi.fn().mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveFirst = resolve
        }),
    )
    const release = vi.fn()
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release,
    })
    controller.edit(id, "#AABBCC")
    controller.edit(id, "#445566")
    controller.edit(id, "#445")
    expect(controller.getSnapshot(id).draft).toBe("#445")
    resolveFirst?.("#AABBCC")
    await tick()
    expect(save).toHaveBeenCalledTimes(1)
    expect(controller.getSnapshot(id)).toMatchObject({
      confirmed: "#AABBCC",
      draft: "#445",
      status: "pending",
    })
    expect(release).toHaveBeenCalled()
  })

  it("never automatically resends an unknown write and requires observation", async () => {
    const controller = createCommunityAccentSaveController()
    const save = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("transport"), {
          networkError: new Error("offline"),
        }),
      )
      .mockResolvedValue("#ABCDEF")
    const observe = vi.fn().mockResolvedValue("#112233")
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe,
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#ABCDEF")
    await tick()
    expect(controller.getSnapshot(id)).toMatchObject({
      status: "attention",
      failure: "unknown",
      inspected: false,
    })
    controller.edit(id, "#ABCDEF")
    controller.retry(id)
    await tick()
    expect(save).toHaveBeenCalledTimes(1)
    await controller.inspect(id)
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: false,
    })
    controller.retry(id)
    await tick()
    expect(save).toHaveBeenCalledTimes(2)
    expect(controller.getSnapshot(id).failure).toBeNull()
  })

  it("requires a fresh inspection if an unknown Accent draft changes", async () => {
    const controller = createCommunityAccentSaveController()
    const save = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("offline"), {
          networkError: new Error("offline"),
        }),
      )
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn().mockResolvedValue("#112233"),
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#AABBCC")
    await tick()
    await controller.inspect(id)
    expect(controller.getSnapshot(id).inspected).toBe(true)

    controller.edit(id, "#445566")
    expect(controller.getSnapshot(id)).toMatchObject({
      failure: "unknown",
      inspected: false,
      observedMatches: false,
      draft: "#445566",
    })
    controller.retry(id)
    await tick()
    expect(save).toHaveBeenCalledTimes(1)
    await controller.inspect(id)
    controller.retry(id)
    await tick()
    expect(save).toHaveBeenCalledTimes(2)
  })

  it("does not send a newer valid draft automatically while Unknown recovery is required", async () => {
    const controller = createCommunityAccentSaveController()
    const save = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("offline"), {
          networkError: new Error("offline"),
        }),
      )
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn().mockResolvedValue("#112233"),
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#AABBCC")
    await tick()
    controller.edit(id, "#445566")
    await tick()
    expect(controller.getSnapshot(id)).toMatchObject({
      draft: "#445566",
      failure: "unknown",
      status: "attention",
    })
    expect(save).toHaveBeenCalledTimes(1)
    await controller.inspect(id)
    expect(save).toHaveBeenCalledTimes(1)
    controller.retry(id)
    await tick()
    expect(save).toHaveBeenCalledTimes(2)
  })

  it("allows explicit completion on an observed match without a second mutation", async () => {
    const controller = createCommunityAccentSaveController()
    const save = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("connection"), {
          networkError: new Error("offline"),
        }),
      )
    const confirm = vi.fn()
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn().mockResolvedValue("#ABCDEF"),
      confirm,
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#ABCDEF")
    await tick()
    await controller.inspect(id)
    expect(controller.getSnapshot(id).observedMatches).toBe(true)
    controller.confirmObservation(id)
    expect(controller.getSnapshot(id)).toMatchObject({
      status: "idle",
      confirmed: "#ABCDEF",
      failure: null,
    })
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(confirm).toHaveBeenCalledWith("#ABCDEF")
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("ignores a stale inspection failure after a newer draft was inspected", async () => {
    const controller = createCommunityAccentSaveController()
    let rejectFirst: ((error: Error) => void) | undefined
    const observe = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<string>((_resolve, reject) => {
            rejectFirst = reject
          }),
      )
      .mockResolvedValue("#445566")
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save: vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error("offline"), {
            networkError: new Error("offline"),
          }),
        ),
      observe,
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#ABCDEF")
    await tick()
    const oldInspection = controller.inspect(id)
    controller.edit(id, "#445566")
    await controller.inspect(id)
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: true,
    })
    rejectFirst?.(new Error("stale request failed"))
    await oldInspection
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: true,
      draft: "#445566",
    })
  })

  it("ignores an older inspection result when a newer inspection of the same draft finishes", async () => {
    const controller = createCommunityAccentSaveController()
    let resolveFirst: ((value: string) => void) | undefined
    const observe = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockResolvedValue("#112233")
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save: vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error("offline"), {
            networkError: new Error("offline"),
          }),
        ),
      observe,
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#AABBCC")
    await tick()
    const older = controller.inspect(id)
    await controller.inspect(id)
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: false,
    })
    resolveFirst?.("#AABBCC")
    await older
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: false,
    })
  })

  it("ignores older inspection failures when a newer inspection of the same draft succeeds", async () => {
    const controller = createCommunityAccentSaveController()
    let rejectFirst: ((error: Error) => void) | undefined
    const observe = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<string>((_resolve, reject) => {
            rejectFirst = reject
          }),
      )
      .mockResolvedValue("#AABBCC")
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save: vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error("offline"), {
            networkError: new Error("offline"),
          }),
        ),
      observe,
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#AABBCC")
    await tick()
    const older = controller.inspect(id)
    await controller.inspect(id)
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: true,
    })
    rejectFirst?.(new Error("superseded failure"))
    await older
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: true,
    })
  })

  it("invalidates a matching observation while a fresh inspection is pending", async () => {
    const controller = createCommunityAccentSaveController()
    let resolveRefresh: ((value: string) => void) | undefined
    const observe = vi
      .fn()
      .mockResolvedValueOnce("#AABBCC")
      .mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            resolveRefresh = resolve
          }),
      )
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save: vi
        .fn()
        .mockRejectedValue(
          Object.assign(new Error("offline"), {
            networkError: new Error("offline"),
          }),
        ),
      observe,
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#AABBCC")
    await tick()
    await controller.inspect(id)
    expect(controller.getSnapshot(id).observedMatches).toBe(true)
    const pending = controller.inspect(id)
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: false,
      observedMatches: false,
    })
    controller.confirmObservation(id)
    expect(controller.getSnapshot(id).failure).toBe("unknown")
    resolveRefresh?.("#112233")
    await pending
    expect(controller.getSnapshot(id)).toMatchObject({
      inspected: true,
      observedMatches: false,
    })
  })

  it("does not roll back a confirmed mutation when an older query result arrives", async () => {
    const controller = createCommunityAccentSaveController()
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save: vi.fn().mockResolvedValue("#ABCDEF"),
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#ABCDEF")
    await tick()
    controller.initialize(id, "#112233")
    expect(controller.getSnapshot(id)).toMatchObject({
      confirmed: "#ABCDEF",
      draft: "#ABCDEF",
    })
  })

  it("requires manual retry after a rejected mutation and keeps Draft on error", async () => {
    const controller = createCommunityAccentSaveController()
    // An explicitly retryable result is distinguishable from an unclassified
    // GraphQL execution error, which must remain Unknown Outcome.
    const rejected = { kind: "retryable" }
    const save = vi
      .fn()
      .mockRejectedValueOnce(rejected)
      .mockResolvedValueOnce("#AABBCC")
    const release = vi.fn()
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release,
    })
    controller.edit(id, "#AABBCC")
    await tick()
    expect(controller.getSnapshot(id)).toMatchObject({
      confirmed: "#112233",
      draft: "#AABBCC",
      failure: "rejected",
      status: "attention",
    })
    expect(release).toHaveBeenCalled()
    await tick()
    expect(save).toHaveBeenCalledTimes(1)
    controller.retry(id)
    await tick()
    expect(save).toHaveBeenCalledTimes(2)
    expect(controller.getSnapshot(id).confirmed).toBe("#AABBCC")
  })

  it("treats unclassified and internal GraphQL execution errors as unknown, never immediate retry", async () => {
    for (const graphQLErrors of [
      [{ extensions: { code: "INTERNAL_SERVER_ERROR" } }],
      [{ message: "Rejected" }],
      [
        { extensions: { code: "VALIDATION" } },
        { extensions: { code: "INTERNAL_SERVER_ERROR" } },
      ],
    ]) {
      const controller = createCommunityAccentSaveController()
      const save = vi.fn().mockRejectedValue({ graphQLErrors })
      controller.initialize(id, "#112233")
      controller.configure(id, {
        save,
        observe: vi.fn().mockResolvedValue("#112233"),
        preview: vi.fn().mockReturnValue(1),
        release: vi.fn(),
      })
      controller.edit(id, "#AABBCC")
      await tick()
      expect(controller.getSnapshot(id)).toMatchObject({
        confirmed: "#112233",
        draft: "#AABBCC",
        failure: "unknown",
        inspected: false,
      })
      controller.retry(id)
      await tick()
      expect(save).toHaveBeenCalledTimes(1)
    }
  })

  it("blocks retry on an authenticated/authorized execution rejection", async () => {
    for (const code of ["UNAUTHENTICATED", "FORBIDDEN", "USER_DELETING"]) {
      const controller = createCommunityAccentSaveController()
      const save = vi.fn().mockRejectedValue({
        graphQLErrors: [{ extensions: { code } }],
      })
      controller.initialize(id, "#112233")
      controller.configure(id, {
        save,
        observe: vi.fn(),
        preview: vi.fn().mockReturnValue(1),
        release: vi.fn(),
      })
      controller.edit(id, "#AABBCC")
      await tick()
      expect(controller.getSnapshot(id)).toMatchObject({
        confirmed: "#112233",
        draft: "#AABBCC",
        failure: "blocked",
        status: "attention",
        blockedFeedback: {
          title: code === "UNAUTHENTICATED"
            ? "ログインが必要です"
            : code === "USER_DELETING"
              ? "アカウントの削除処理中です"
              : "Community設定を変更できません",
        },
      })
      controller.edit(id, "#445566")
      controller.retry(id)
      await tick()
      expect(save).toHaveBeenCalledTimes(1)
      controller.discard(id)
      expect(controller.getSnapshot(id).blockedFeedback).toBeNull()
    }
  })

  it("discards an errored draft without pretending to cancel an unknown mutation", async () => {
    const controller = createCommunityAccentSaveController()
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save: vi.fn().mockRejectedValue(new Error("unconfirmed")),
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#AABBCC")
    await tick()
    controller.discard(id)
    expect(controller.getSnapshot(id)).toMatchObject({
      draft: "#112233",
      confirmed: "#112233",
      failure: null,
      status: "idle",
    })
  })

  it("does not leak Draft or failure state between communities", async () => {
    const controller = createCommunityAccentSaveController()
    controller.initialize("community-a", "#112233")
    controller.initialize("community-b", "#445566")
    controller.edit("community-a", "#1")
    expect(controller.getSnapshot("community-a").draft).toBe("#1")
    expect(controller.getSnapshot("community-b")).toMatchObject({
      confirmed: "#445566",
      draft: "#445566",
      status: "idle",
    })
  })

  it("preserves newer Draft when an old in-flight mutation completes", async () => {
    const controller = createCommunityAccentSaveController()
    let resolveFirst: ((value: string) => void) | undefined
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockResolvedValue("#445566")
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#ABCDEF")
    controller.edit(id, "#445566")
    resolveFirst?.("#ABCDEF")
    await tick()
    expect(save).toHaveBeenCalledTimes(2)
    expect(controller.getSnapshot(id)).toMatchObject({
      confirmed: "#445566",
      draft: "#445566",
      status: "saved",
    })
  })

  it("retains Typed accent Field Validation with its Draft after rejection", async () => {
    const controller = createCommunityAccentSaveController()
    const save = vi.fn().mockRejectedValue(new SettingsInputValidationError([
      { scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] },
    ]))
    controller.initialize(id, "#112233")
    controller.configure(id, {
      save,
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.edit(id, "#ABCDEF")
    await tick()
    expect(controller.getSnapshot(id)).toMatchObject({
      failure: "rejected",
      draft: "#ABCDEF",
      validation: {
        fieldErrors: { accentColor: "入力形式を確認してください。" },
        formError: false,
      },
    })
    controller.discard(id)
    expect(controller.getSnapshot(id)).toMatchObject({ failure: null, validation: null })
  })

  it("isolates a late unknown failure from another Community's successful save", async () => {
    const controller = createCommunityAccentSaveController()
    let rejectOld: ((reason: unknown) => void) | undefined
    const newRelease = vi.fn()
    controller.initialize("community-a", "#112233")
    controller.initialize("community-b", "#445566")
    controller.configure("community-a", {
      save: () =>
        new Promise<string>((_resolve, reject) => {
          rejectOld = reject
        }),
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release: vi.fn(),
    })
    controller.configure("community-b", {
      save: vi.fn().mockResolvedValue("#CCDDEE"),
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(2),
      release: newRelease,
    })
    controller.edit("community-a", "#AABBCC")
    controller.edit("community-b", "#CCDDEE")
    await tick()
    expect(controller.getSnapshot("community-b")).toMatchObject({
      confirmed: "#CCDDEE", failure: null, status: "saved",
    })
    const released = newRelease.mock.calls.length
    rejectOld?.({ graphQLErrors: [{ extensions: { code: "INTERNAL_SERVER_ERROR" } }] })
    await tick()
    expect(controller.getSnapshot("community-a")).toMatchObject({
      confirmed: "#112233", draft: "#AABBCC", failure: "unknown",
    })
    expect(controller.getSnapshot("community-b")).toMatchObject({
      confirmed: "#CCDDEE", draft: "#CCDDEE", failure: null, status: "saved",
    })
    expect(newRelease).toHaveBeenCalledTimes(released)
  })

  it("keeps the new Community independent when an old Community mutation settles late", async () => {
    const controller = createCommunityAccentSaveController()
    let resolveOld: ((value: string) => void) | undefined
    const oldRelease = vi.fn()
    const newRelease = vi.fn()
    const newPreview = vi.fn().mockReturnValue(2)
    controller.initialize("community-a", "#112233")
    controller.initialize("community-b", "#445566")
    controller.configure("community-a", {
      save: () => new Promise<string>((resolve) => { resolveOld = resolve }),
      observe: vi.fn(),
      preview: vi.fn().mockReturnValue(1),
      release: oldRelease,
    })
    controller.configure("community-b", {
      save: vi.fn().mockResolvedValue("#CCDDEE"),
      observe: vi.fn(),
      preview: newPreview,
      release: newRelease,
    })
    // Route/Community switches while the first mutation is still in-flight.
    controller.edit("community-a", "#ABCDEF")
    controller.edit("community-b", "#CCDDEE")
    await tick()
    expect(controller.getSnapshot("community-b")).toMatchObject({
      confirmed: "#CCDDEE", draft: "#CCDDEE", status: "saved",
    })
    const newReleaseCount = newRelease.mock.calls.length
    resolveOld?.("#ABCDEF")
    await tick()
    expect(controller.getSnapshot("community-a")).toMatchObject({
      confirmed: "#ABCDEF", draft: "#ABCDEF", status: "saved",
    })
    expect(controller.getSnapshot("community-b")).toMatchObject({
      confirmed: "#CCDDEE", draft: "#CCDDEE", status: "saved",
    })
    expect(newRelease).toHaveBeenCalledTimes(newReleaseCount)
    expect(newPreview).toHaveBeenCalledWith("#CCDDEE")
    expect(oldRelease).toHaveBeenCalled()
  })

})
