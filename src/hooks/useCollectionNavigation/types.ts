export type NavigationNode<T> =
  | {
      index: number
      exists: true
      item: T
    }
  | {
      index: number
      exists: false
      item: undefined
    }
