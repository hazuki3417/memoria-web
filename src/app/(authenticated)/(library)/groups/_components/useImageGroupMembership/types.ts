export type ImageGroupMembershipItem = {
  id: string
}

export type ImageGroupMembershipStatus =
  | "none"
  | "existing"
  | "added"
  | "removed"

export type UseImageGroupMembershipValue<T extends ImageGroupMembershipItem> = {
  ids: {
    initial: string[]
    added: string[]
    removed: string[]
    final: string[]
  }
  items: {
    initial: T[]
    added: T[]
    removed: T[]
    final: T[]
  }
  getStatus: (id: string) => ImageGroupMembershipStatus
}

export type UseImageGroupMembershipOption<T extends ImageGroupMembershipItem> =
  {
    items: T[]
  }

export interface UseImageGroupMembershipControl<
  T extends ImageGroupMembershipItem,
> {
  add: (item: T) => void
  remove: (id: string) => void
}

export interface UseImageGroupMembershipAction<
  T extends ImageGroupMembershipItem,
> {
  reset: () => void
  initialize: (items: T[]) => void
}

export interface UseImageGroupMembership<T extends ImageGroupMembershipItem> {
  value: UseImageGroupMembershipValue<T>
  control: UseImageGroupMembershipControl<T>
  action: UseImageGroupMembershipAction<T>
}
