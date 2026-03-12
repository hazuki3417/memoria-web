import { NavigationNode } from "./types"

export type GetNextArgs<T> = {
  items: T[]
  index: number
  loop?: boolean
}

export const getNext = <T>(args: GetNextArgs<T>): NavigationNode<T> => {
  const { items, index, loop = false } = args

  const length = items.length
  const nextIndex = index + 1

  const isLast = nextIndex >= length
  const shouldLoop = loop && length > 0

  if (isLast && shouldLoop) {
    const firstIndex = 0

    return {
      index: firstIndex,
      item: items[firstIndex],
      exists: true,
    }
  }

  const exists = items[nextIndex] !== undefined

  if (!exists) {
    return {
      index: nextIndex,
      item: undefined,
      exists: false,
    }
  }

  return {
    index: nextIndex,
    item: items[nextIndex],
    exists: true,
  }
}
