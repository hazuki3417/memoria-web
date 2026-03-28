export type ImageGroupMembershipStatus =
  | "none"
  | "existing"
  | "added"
  | "removed"

export type UseImageGroupMembershipValue = {
  initialImageIds: string[]
  addedImageIds: string[]
  removedImageIds: string[]

  finalImageIds: string[]

  getStatus: (imageId: string) => ImageGroupMembershipStatus
}

export type UseImageGroupMembershipOption = {
  initialImageIds: string[]
}

export interface UseImageGroupMembershipControl {
  addImage: (imageId: string) => void
  removeImage: (imageId: string) => void
}

export interface UseImageGroupMembershipAction {
  reset: () => void
}

export interface UseImageGroupMembership {
  value: UseImageGroupMembershipValue
  control: UseImageGroupMembershipControl
  action: UseImageGroupMembershipAction
}
