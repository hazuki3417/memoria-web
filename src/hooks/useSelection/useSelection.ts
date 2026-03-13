"use client"
import { useCallback, useMemo, useState } from "react"

export type UseSelectionArgs<T> = {
  initial?: T[]
}

export type UseSelectionValue<T> = {
  selected: Set<T>
  list: T[]
  size: number
}

// export interface UseSelectionControl {
// }

export interface UseSelectionAction<T> {
  isSelected: (id: T) => boolean
  select: (id: T) => void
  deselect: (id: T) => void
  toggle: (id: T) => void
  clear: () => void
}

export interface UseSelection<T> {
  value: UseSelectionValue<T>
  // control: UseSelectionControl
  action: UseSelectionAction<T>
}

export const useSelection = <Id extends string | number>(
  args: UseSelectionArgs<Id> = {},
): UseSelection<Id> => {
  const { initial = [] } = args
  const [selected, setSelected] = useState<Set<Id>>(() => new Set(initial))
  const list = useMemo(() => Array.from(selected), [selected])
  const size = selected.size

  const isSelected = useCallback((id: Id) => selected.has(id), [selected])

  const select = useCallback((id: Id) => {
    setSelected((prev) => {
      if (prev.has(id)) return prev

      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const deselect = useCallback((id: Id) => {
    setSelected((prev) => {
      if (!prev.has(id)) return prev

      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggle = useCallback((id: Id) => {
    setSelected((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }, [])

  const clear = useCallback(() => {
    setSelected(new Set())
  }, [])

  const value = useMemo(
    () => ({ selected, list, size }),
    [selected, list, size],
  )
  const action = useMemo(
    () => ({
      isSelected,
      select,
      deselect,
      toggle,
      clear,
    }),
    [isSelected, select, deselect, toggle, clear],
  )

  return {
    value,
    action,
  }
}
