"use client"
import "client-only"
import { useMemo } from "react"
import { getCurrent } from "./getCurrent"
import { getNext } from "./getNext"
import { getPrev } from "./getPrev"
import { NavigationNode } from "./types"

export type UseCollectionNavigationArgs<T> = {
  items: T[]
  predicate: (item: T, index: number, items: T[]) => boolean
  loop?: boolean
}

export type CollectionNavigation<T> = {
  length: number
  current: NavigationNode<T>
  prev: NavigationNode<T>
  next: NavigationNode<T>
}

export function useCollectionNavigation<T>(
  args: UseCollectionNavigationArgs<T>,
): CollectionNavigation<T> {
  const { items, predicate, loop = false } = args

  return useMemo(() => {
    const index = items.findIndex(predicate)

    const current = getCurrent({ items, index })
    const prev = getPrev({ items, index, loop })
    const next = getNext({ items, index, loop })

    return {
      length: items.length,
      current,
      prev,
      next,
    }
  }, [items, predicate, loop])
}
