import { useCallback, useMemo, useReducer } from "react"
import {
  createImageGroupMembershipState,
  imageGroupMembershipReducer,
} from "./imageGroupMembershipReducer"
import {
  ImageGroupMembershipItem,
  ImageGroupMembershipStatus,
  UseImageGroupMembership,
  UseImageGroupMembershipOption,
} from "./types"

export const useImageGroupMembership = <T extends ImageGroupMembershipItem>(
  option: UseImageGroupMembershipOption<T>,
): UseImageGroupMembership<T> => {
  const [state, dispatch] = useReducer(
    imageGroupMembershipReducer,
    option.items,
    createImageGroupMembershipState,
  )

  const { ids, entities } = state

  const getStatus = useCallback(
    (imageId: string): ImageGroupMembershipStatus => {
      if (ids.removed.has(imageId)) return "removed"
      if (ids.added.has(imageId)) return "added"
      if (ids.initial.has(imageId)) return "existing"
      return "none"
    },
    [ids.initial, ids.added, ids.removed],
  )

  /**
   * calculated ids
   */
  const initialIds = useMemo(() => Array.from(ids.initial), [ids.initial])
  const addedIds = useMemo(() => Array.from(ids.added), [ids.added])
  const removedIds = useMemo(() => Array.from(ids.removed), [ids.removed])
  const finalIds = useMemo(() => {
    const result = new Set(ids.initial)
    ids.added.forEach((id) => result.add(id))
    ids.removed.forEach((id) => result.delete(id))
    return Array.from(result)
  }, [ids.initial, ids.added, ids.removed])

  /**
   * calculated items
   */
  const initialItems = useMemo(() => {
    return Array.from(ids.initial)
      .map((id) => entities.get(id))
      .filter((item): item is T => item !== undefined)
  }, [ids.initial, entities])
  const addedItems = useMemo(() => {
    return Array.from(ids.added)
      .map((id) => entities.get(id))
      .filter((item): item is T => item !== undefined)
  }, [ids.added, entities])
  const removedItems = useMemo(() => {
    return Array.from(ids.removed)
      .map((id) => entities.get(id))
      .filter((item): item is T => item !== undefined)
  }, [ids.removed, entities])
  const finalItems = useMemo(() => {
    return finalIds
      .map((id) => entities.get(id))
      .filter((item): item is T => item !== undefined)
  }, [finalIds, entities])

  /**
   * handler functions
   */
  const addItem = useCallback((item: T) => {
    dispatch({ type: "add", item })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "remove", id })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "reset" })
  }, [])

  const initialize = useCallback((items: T[]) => {
    dispatch({
      type: "initialize",
      items,
    })
  }, [])

  return {
    value: {
      ids: {
        initial: initialIds,
        added: addedIds,
        removed: removedIds,
        final: finalIds,
      },
      items: {
        initial: initialItems,
        added: addedItems,
        removed: removedItems,
        final: finalItems,
      },
      getStatus: getStatus,
    },
    control: {
      add: addItem,
      remove: removeItem,
    },
    action: {
      reset: reset,
      initialize: initialize,
    },
  }
}
