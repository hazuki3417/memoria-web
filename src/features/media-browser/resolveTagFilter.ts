export type BrowserTag = { id: string; name: string }

export type TagFilterResolution =
  | { ok: true; tagIds: string[] }
  | { ok: false; reason: "UNKNOWN_TAG" | "DUPLICATE_TAG" }

// Tag display names never become filter IDs. Unknown and ambiguous selections
// fail instead of broadening the query or pretending the result is empty.
export function resolveTagFilter(names: readonly string[], tags: readonly BrowserTag[]): TagFilterResolution {
  const byName = new Map<string, string>()
  for (const tag of tags) {
    if (byName.has(tag.name)) return { ok: false, reason: "DUPLICATE_TAG" }
    byName.set(tag.name, tag.id)
  }
  const result: string[] = []
  const seen = new Set<string>()
  for (const name of names) {
    const id = byName.get(name)
    if (!id) return { ok: false, reason: "UNKNOWN_TAG" }
    if (seen.has(id)) return { ok: false, reason: "DUPLICATE_TAG" }
    seen.add(id)
    result.push(id)
  }
  return { ok: true, tagIds: result }
}
