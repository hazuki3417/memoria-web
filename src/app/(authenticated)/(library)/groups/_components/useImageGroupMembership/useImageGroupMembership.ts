import { useCallback, useMemo, useReducer } from "react"
import {
  createImageGroupMembershipState,
  imageGroupMembershipReducer,
} from "./imageGroupMembershipReducer"
import {
  ImageGroupMembershipStatus,
  UseImageGroupMembership,
  UseImageGroupMembershipOption,
} from "./types"

export const useImageGroupMembership = (
  option: UseImageGroupMembershipOption,
): UseImageGroupMembership => {
  const [membershipState, dispatch] = useReducer(
    imageGroupMembershipReducer,
    option.initialImageIds,
    createImageGroupMembershipState,
  )

  const { initialImageIds, addedImageIds, removedImageIds } = membershipState

  const getImageMembershipStatus = useCallback(
    (imageId: string): ImageGroupMembershipStatus => {
      if (removedImageIds.has(imageId)) return "removed"
      if (addedImageIds.has(imageId)) return "added"
      if (initialImageIds.has(imageId)) return "existing"
      return "none"
    },
    [initialImageIds, addedImageIds, removedImageIds],
  )

  const finalImageIds = useMemo(() => {
    const result = new Set(initialImageIds)

    addedImageIds.forEach((id) => result.add(id))
    removedImageIds.forEach((id) => result.delete(id))

    return Array.from(result)
  }, [initialImageIds, addedImageIds, removedImageIds])

  const addImageToGroup = useCallback((imageId: string) => {
    dispatch({ type: "ADD_IMAGE_TO_GROUP", imageId })
  }, [])

  const removeImageFromGroup = useCallback((imageId: string) => {
    dispatch({ type: "REMOVE_IMAGE_FROM_GROUP", imageId })
  }, [])

  const resetImageGroupMembership = useCallback(() => {
    dispatch({ type: "RESET_IMAGE_GROUP_MEMBERSHIP" })
  }, [])

  return {
    value: {
      initialImageIds: Array.from(initialImageIds),
      addedImageIds: Array.from(addedImageIds),
      removedImageIds: Array.from(removedImageIds),
      finalImageIds,
      getStatus: getImageMembershipStatus,
    },
    control: {
      addImage: addImageToGroup,
      removeImage: removeImageFromGroup,
    },
    action: {
      reset: resetImageGroupMembership,
    },
  }
}
