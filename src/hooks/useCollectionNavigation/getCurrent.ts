import { NavigationNode } from "./types"

export type GetCurrentArgs<T> = {
  items: T[]
  index: number
}

export const getCurrent = <T>(args: GetCurrentArgs<T>): NavigationNode<T> => {
  const { items, index } = args
  return {
    index,
    item: items[index],
    exists: index >= 0 && index < items.length,
  }
}
