import {
  MediaGroupRelationChangeAction,
  MediaGroupRelationDirection,
} from "@/infrastructure/graphql/generated"

export type GroupRelationDraft = {
  parents: readonly string[]
  children: readonly string[]
}

export type GroupRelationChange = {
  groupId: string
  direction: MediaGroupRelationDirection
  action: MediaGroupRelationChangeAction
}

/** A relation is identified by its Group ID, never by its displayed label. */
export function groupRelationChanges(
  desired: GroupRelationDraft,
  previous: GroupRelationDraft,
  nameToId: ReadonlyMap<string, string>,
): GroupRelationChange[] {
  const result: GroupRelationChange[] = []
  for (const { direction, next, current } of [
    {
      direction: MediaGroupRelationDirection.Parent,
      next: desired.parents,
      current: previous.parents,
    },
    {
      direction: MediaGroupRelationDirection.Child,
      next: desired.children,
      current: previous.children,
    },
  ]) {
    for (const name of next.filter((value) => !current.includes(value))) {
      const id = nameToId.get(name)
      if (!id) throw new Error("Relation candidate is not available in this scope")
      result.push({
        groupId: id,
        direction,
        action: MediaGroupRelationChangeAction.Add,
      })
    }
    for (const name of current.filter((value) => !next.includes(value))) {
      const id = nameToId.get(name)
      if (!id) throw new Error("Existing relation is no longer available")
      result.push({
        groupId: id,
        direction,
        action: MediaGroupRelationChangeAction.Remove,
      })
    }
  }
  return result
}
