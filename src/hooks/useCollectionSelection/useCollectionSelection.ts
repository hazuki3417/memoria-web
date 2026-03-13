"use client"

import { useCallback, useMemo } from "react"
import { useSelection } from "../useSelection"

export type UseCollectionSelectionArgs<T, Id extends string | number> = {
  items: T[]
  getKey: (item: T) => Id
  min?: number
  max?: number
}

export type UseCollectionSelectionValue<T, Id> = {
  ids: Id[]
  items: T[]
  size: number
  min: number
  max: number

  allSelected: boolean
  indeterminate: boolean
}

export type UseCollectionSelectionAction<T> = {
  toggle: (item: T) => void
  selectAll: () => void
  clear: () => void
}

export type UseCollectionSelection<T, Id extends string | number> = {
  value: UseCollectionSelectionValue<T, Id>
  action: UseCollectionSelectionAction<T>
}

export function useCollectionSelection<T, Id extends string | number>(
  args: UseCollectionSelectionArgs<T, Id>,
): UseCollectionSelection<T, Id> {
  const { items, getKey, min = 0, max = Infinity } = args

  const selection = useSelection<Id>()

  const ids = useMemo(() => items.map(getKey), [items, getKey])

  const selectedIds = selection.value.list

  const selectedItems = useMemo(
    () => items.filter((item) => selection.value.selected.has(getKey(item))),
    [items, selection.value.selected, getKey],
  )

  const selectedCount = selectedIds.length

  const allSelected =
    ids.length > 0 && ids.every((id) => selection.value.selected.has(id))

  const indeterminate = selectedCount > 0 && !allSelected

  const toggle = useCallback(
    (item: T) => {
      const id = getKey(item)

      if (selection.value.selected.has(id)) {
        if (selectedCount <= min) return
        selection.action.deselect(id)
      } else {
        if (selectedCount >= max) return
        selection.action.select(id)
      }
    },
    [selection, getKey, selectedCount, min, max],
  )

  const selectAll = useCallback(() => {
    for (const id of ids) {
      if (selection.value.selected.size >= max) break
      selection.action.select(id)
    }
  }, [ids, selection, max])

  const clear = useCallback(() => {
    if (min > 0) return
    selection.action.clear()
  }, [selection, min])

  return {
    value: {
      ids: selectedIds,
      items: selectedItems,
      size: selectedCount,
      min,
      max,
      allSelected,
      indeterminate,
    },
    action: {
      selectAll,
      clear,
      toggle,
    },
  }
}
