type ImageGroupMembershipState = {
  initialImageIds: Set<string>
  addedImageIds: Set<string>
  removedImageIds: Set<string>
}

type ImageGroupMembershipAction =
  | { type: "ADD_IMAGE_TO_GROUP"; imageId: string }
  | { type: "REMOVE_IMAGE_FROM_GROUP"; imageId: string }
  | { type: "RESET_IMAGE_GROUP_MEMBERSHIP" }
  | { type: "INITIALIZE_IMAGE_GROUP_MEMBERSHIP"; imageIds: string[] }

export const createImageGroupMembershipState = (
  initialImageIds: string[],
): ImageGroupMembershipState => ({
  initialImageIds: new Set(initialImageIds),
  addedImageIds: new Set(),
  removedImageIds: new Set(),
})

export const imageGroupMembershipReducer = (
  membershipState: ImageGroupMembershipState,
  action: ImageGroupMembershipAction,
): ImageGroupMembershipState => {
  switch (action.type) {
    case "ADD_IMAGE_TO_GROUP": {
      const { imageId } = action

      const nextAddedImageIds = new Set(membershipState.addedImageIds)
      const nextRemovedImageIds = new Set(membershipState.removedImageIds)

      // 除去予定 → 元に戻す
      if (nextRemovedImageIds.has(imageId)) {
        nextRemovedImageIds.delete(imageId)

        return {
          ...membershipState,
          removedImageIds: nextRemovedImageIds,
        }
      }

      // 新規追加
      if (!membershipState.initialImageIds.has(imageId)) {
        nextAddedImageIds.add(imageId)
      }

      return {
        ...membershipState,
        addedImageIds: nextAddedImageIds,
      }
    }

    case "REMOVE_IMAGE_FROM_GROUP": {
      const { imageId } = action

      const nextAddedImageIds = new Set(membershipState.addedImageIds)
      const nextRemovedImageIds = new Set(membershipState.removedImageIds)

      // 追加予定 → 取り消し
      if (nextAddedImageIds.has(imageId)) {
        nextAddedImageIds.delete(imageId)

        return {
          ...membershipState,
          addedImageIds: nextAddedImageIds,
        }
      }

      // 既存 → 除去予定
      if (membershipState.initialImageIds.has(imageId)) {
        nextRemovedImageIds.add(imageId)
      }

      return {
        ...membershipState,
        removedImageIds: nextRemovedImageIds,
      }
    }

    case "RESET_IMAGE_GROUP_MEMBERSHIP": {
      return {
        initialImageIds: membershipState.initialImageIds,
        addedImageIds: new Set(),
        removedImageIds: new Set(),
      }
    }

    case "INITIALIZE_IMAGE_GROUP_MEMBERSHIP": {
      return createImageGroupMembershipState(action.imageIds)
    }

    default:
      return membershipState
  }
}
