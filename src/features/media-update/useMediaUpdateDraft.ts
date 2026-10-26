"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  listMediaUpdateTags,
  readMediaTagEditState,
  saveMediaTags,
  toDesiredMediaTags,
  type MediaTagRecord,
  type MediaUpdateScope,
} from "./mediaTagApi"

export type MediaUpdateDraftItem = {
  id: string
  label: string
  detail: string
  tags: string[]
}
type SaveStatus = "idle" | "loading" | "saving" | "saved" | "partial-failure" | "load-failure"
export type LoadedItem = MediaUpdateDraftItem & {
  original: string[]
  stateToken: string
  error?: string
}

/** Keeps the Media Update UI draft separate from persisted per-Media state. */
export function useMediaUpdateDraft(
  targets: readonly { id: string; label: string; detail: string }[],
  scope: MediaUpdateScope,
) {
  const [items, setItems] = useState<LoadedItem[]>([])
  const [status, setStatus] = useState<SaveStatus>("loading")
  const [catalog, setCatalog] = useState<MediaTagRecord[]>([])
  const scopeKey = scope.type === "PERSONAL" ? "personal" : `community:${scope.communityId}`
  const idsKey = targets.map((target) => target.id).join(",")
  const load = useCallback(async () => {
    setStatus("loading")
    if (targets.length === 0) {
      setItems([])
      setStatus("load-failure")
      return
    }
    const knownTags = await listMediaUpdateTags(scope)
    if (knownTags.kind !== "ok") {
      setStatus("load-failure")
      return
    }
    const byId = new Map(knownTags.value.map((tag) => [tag.id, tag.name]))
    const snapshots = await Promise.all(
      targets.map(async (target) => ({
        target,
        result: await readMediaTagEditState(target.id, scope),
      })),
    )
    if (snapshots.some((entry) => entry.result.kind !== "ok")) {
      setStatus("load-failure")
      return
    }
    setCatalog(knownTags.value)
    setItems(snapshots.map(({ target, result }) => {
      if (result.kind !== "ok") throw new Error("unexpected failed state")
      const tags = result.value.tagIds.map((id) => byId.get(id)).filter((name): name is string => name !== undefined)
      // Never silently treat missing catalog names as an empty relation set.
      if (tags.length !== result.value.tagIds.length) throw new Error("Tag catalog is incomplete")
      return { ...target, tags, original: [...tags], stateToken: result.value.stateToken }
    }))
    setStatus("idle")
  // Only reload when the selected target IDs or Scope change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, scopeKey])
  useEffect(() => { void load().catch(() => setStatus("load-failure")) }, [load])

  const changed = useMemo(
    () => items.some((item) =>
      item.tags.length !== item.original.length ||
      item.tags.some((tag) => !item.original.includes(tag))),
    [items],
  )
  const updateTags = useCallback((id: string, tags: string[]) => {
    setItems((current) => current.map((item) =>
      item.id === id ? { ...item, tags, error: undefined } : item))
    setStatus("idle")
  }, [])
  const discard = useCallback((id: string) =>
    setItems((current) => current.filter((item) => item.id !== id)), [])
  const refreshFailed = useCallback(async (id: string) => {
    const response = await readMediaTagEditState(id, scope)
    if (response.kind !== "ok") return
    const catalogResponse = await listMediaUpdateTags(scope)
    if (catalogResponse.kind !== "ok") return
    const names = new Map(catalogResponse.value.map((tag) => [tag.id, tag.name]))
    const original = response.value.tagIds.map((tagID) => names.get(tagID))
    if (original.some((name) => name === undefined)) return
    setCatalog(catalogResponse.value)
    setItems((current) => current.map((item) =>
      item.id === id ? {
        ...item,
        // Preserve the unsaved draft. A new token is only accepted after
        // explicitly refreshing that Media; the user must review differences.
        original: original as string[],
        stateToken: response.value.stateToken,
        error: undefined,
      } : item))
    setStatus("idle")
  }, [scopeKey])
  const save = useCallback(async () => {
    if (status === "saving") return
    const pending = items.filter((item) => !item.error &&
      item.tags.length !== item.original.length ||
      item.tags.some((name) => !item.original.includes(name)))
    if (!pending.length) return
    setStatus("saving")
    const results = await Promise.all(pending.map(async (item) => ({
      id: item.id,
      result: await saveMediaTags(item.id, scope, item.stateToken, toDesiredMediaTags(item.tags, catalog)),
    })))
    const byId = new Map(results.map((entry) => [entry.id, entry.result]))
    setItems((current) => current.map((item) => {
      const result = byId.get(item.id)
      if (!result) return item
      if (result.kind === "ok") return {
        ...item, original: [...item.tags], stateToken: result.value.stateToken,
        error: undefined,
      }
      return { ...item, error: result.kind }
    }))
    setStatus(results.some((entry) => entry.result.kind !== "ok") ? "partial-failure" : "saved")
  }, [catalog, items, scope, status])
  return { items, status, changed, updateTags, discard, save, reload: load, refreshFailed }
}
