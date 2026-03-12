"use client"
import { useEffect } from "react"
import { getCollectionPreloadIndexes } from "./getCollectionPreloadIndexes"

export type UseCollectionPreloadArgs<T> = {
  items: T[]
  index: number
  loop?: boolean
  distance?: number
  getSrc: (item: T) => string | undefined
}

export const useCollectionPreload = <T>(args: UseCollectionPreloadArgs<T>) => {
  const { items, index, loop = false, distance = 1, getSrc } = args
  useEffect(() => {
    const indexes = getCollectionPreloadIndexes({
      length: items.length,
      index,
      loop,
      distance,
    })

    indexes.forEach((i) => {
      const item = items[i]
      const src = item ? getSrc(item) : undefined

      if (!src) return

      const img = new Image()
      img.src = src
    })
  }, [items, index, loop, distance, getSrc])
}
