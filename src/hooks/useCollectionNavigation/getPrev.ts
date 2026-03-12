import { NavigationNode } from "./types"

export type GetPrevArgs<T> = {
  items: T[]
  index: number
  loop?: boolean
}

export const getPrev = <T>(args: GetPrevArgs<T>): NavigationNode<T> => {
  const { items, index, loop = false } = args

  const length = items.length
  const prevIndex = index - 1

  const isFirst = prevIndex < 0
  const shouldLoop = loop && length > 0

  if (isFirst && shouldLoop) {
    const lastIndex = length - 1

    return {
      index: lastIndex,
      item: items[lastIndex],
      exists: true,
    }
  }

  const exists = items[prevIndex] !== undefined

  if (!exists) {
    return {
      index: prevIndex,
      item: undefined,
      exists: false,
    }
  }

  return {
    index: prevIndex,
    item: items[prevIndex],
    exists: true,
  }
}
