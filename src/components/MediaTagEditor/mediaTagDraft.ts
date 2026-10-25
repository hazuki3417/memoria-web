/**
 * Pure Tag draft operations shared by Media Upload and Media Update.
 * This module updates only the local draft; it never persists Tag entities or relations.
 */
export type MediaTagDraftAction = "add" | "remove" | "replace"

export function applyMediaTagDraftAction(
  tags: readonly string[],
  tag: string,
  action: MediaTagDraftAction,
): string[] {
  const name = tag.trim()
  if (!name) return [...tags]
  if (action === "replace") return [name]
  if (action === "remove") return tags.filter((value) => value !== name)
  return tags.includes(name) ? [...tags] : [...tags, name]
}

/**
 * Compute the exact relations to add/remove for a single Media.
 * Unchanged relations are never sent as an implicit replacement.
 */
export function diffMediaTagDraft(
  savedTags: readonly string[],
  draftTags: readonly string[],
): { add: string[]; remove: string[] } {
  const saved = new Set(savedTags)
  const draft = new Set(draftTags)
  return {
    add: [...draft].filter((tag) => !saved.has(tag)),
    remove: [...saved].filter((tag) => !draft.has(tag)),
  }
}
