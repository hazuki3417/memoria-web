import { NavigationNode } from "./types"

export type GetCurrentArgs<T> = {
  items: T[]
  index: number
}

export const getCurrent = <T>(args: GetCurrentArgs<T>): NavigationNode<T> => {
  const { items, index } = args

  const exists = items[index] !== undefined

  if (!exists) {
    return {
      index: index,
      item: undefined,
      exists: false,
    }
  }

  return {
    index: index,
    item: items[index],
    exists: true,
  }
}
