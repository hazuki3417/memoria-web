import type { GroupBrowserGroup } from "./GroupBrowser"

/**
 * Preserve the original ordering and the distinct search semantics for
 * externally supplied groups vs. local preview fixtures.
 */
export function filterVisibleGroups<T extends Pick<GroupBrowserGroup, "name">>(
  allGroups: T[],
  appliedQuery: string,
  hasExternalData: boolean,
): T[] {
  const normalized = appliedQuery.trim()
  if (!normalized) return allGroups
  return allGroups.filter((group) =>
    hasExternalData
      ? group.name.includes(normalized)
      : group.name
          .toLocaleLowerCase()
          .includes(normalized.toLocaleLowerCase()),
  )
}
