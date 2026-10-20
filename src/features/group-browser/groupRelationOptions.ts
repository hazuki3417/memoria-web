/**
 * Pure view-model logic for the Group Browser relation selector.
 * Keep it independent of Mantine and GraphQL so the same conditions
 * can be verified without rendering the editor.
 */
export type GroupRelationDirection = "parent" | "child"

export type GroupRelationCandidateAvailability = Record<
  string,
  {
    parent: { canAdd: boolean; reason?: string }
    child: { canAdd: boolean; reason?: string }
  }
>

export type GroupRelationOptionInput = {
  candidates: string[]
  names: string[]
  oppositeNames: string[]
  currentGroupName: string
  direction: GroupRelationDirection
  availability?: GroupRelationCandidateAvailability
}

export function sortGroupRelationNames(values: string[]): string[] {
  return [...values].sort()
}

export function groupRelationOptions({
  candidates,
  names,
  oppositeNames,
  currentGroupName,
  direction,
  availability,
}: GroupRelationOptionInput): Array<{
  value: string
  label: string
  disabled: boolean
}> {
  return candidates.map((name) => ({
    value: name,
    label: name,
    disabled:
      name === currentGroupName ||
      oppositeNames.includes(name) ||
      (availability?.[name]?.[direction].canAdd === false &&
        !names.includes(name)),
  }))
}

export function groupRelationOptionReason({
  name,
  checked,
  oppositeNames,
  currentGroupName,
  direction,
  availability,
}: Pick<
  GroupRelationOptionInput,
  "oppositeNames" | "currentGroupName" | "direction" | "availability"
> & {
  name: string
  checked: boolean
}): string {
  if (name === currentGroupName) return "現在のGroup"
  if (oppositeNames.includes(name)) {
    return direction === "parent"
      ? "Childに指定されています"
      : "Parentに指定されています"
  }
  if (checked) return "選択済み"
  return availability?.[name]?.[direction].reason ?? ""
}
