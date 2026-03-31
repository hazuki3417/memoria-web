import { ImageGroupMembershipItem } from "./types"

type ImageGroupMembershipState<T extends ImageGroupMembershipItem> = {
  ids: {
    initial: Set<string>
    added: Set<string>
    removed: Set<string>
  }
  entities: Map<string, T>
}

type ImageGroupMembershipAction<T extends ImageGroupMembershipItem> =
  | { type: "add"; item: T }
  | { type: "remove"; id: string }
  | { type: "reset" }
  | { type: "initialize"; items: T[] }

export const createImageGroupMembershipState = <
  T extends ImageGroupMembershipItem,
>(
  items: T[],
): ImageGroupMembershipState<T> => {
  const entities = new Map<string, T>()
  const initial = new Set<string>()
  const added = new Set<string>()
  const removed = new Set<string>()

  items.forEach((item) => {
    entities.set(item.id, item)
    initial.add(item.id)
  })

  return {
    ids: {
      initial,
      added,
      removed,
    },
    entities,
  }
}

export const imageGroupMembershipReducer = <T extends ImageGroupMembershipItem>(
  state: ImageGroupMembershipState<T>,
  action: ImageGroupMembershipAction<T>,
): ImageGroupMembershipState<T> => {
  switch (action.type) {
    case "add": {
      const { item } = action

      const added = new Set(state.ids.added)
      const removed = new Set(state.ids.removed)
      const entities = new Map(state.entities)

      entities.set(item.id, item)

      // 削除予定のものをもとに戻す
      if (removed.has(item.id)) {
        removed.delete(item.id)
        return {
          ...state,
          ids: {
            ...state.ids,
            removed,
          },
          entities,
        }
      }

      // 新規追加
      if (!state.ids.initial.has(item.id)) {
        added.add(item.id)
      }

      return {
        ...state,
        ids: {
          ...state.ids,
          added,
        },
        entities,
      }
    }

    case "remove": {
      const { id } = action

      const added = new Set(state.ids.added)
      const removed = new Set(state.ids.removed)

      // 追加予定のものを削除する
      if (added.has(id)) {
        added.delete(id)

        return {
          ...state,
          ids: {
            ...state.ids,
            added,
          },
        }
      }

      // 既存のものを削除する
      if (state.ids.initial.has(id)) {
        removed.add(id)
      }

      return {
        ...state,
        ids: {
          ...state.ids,
          removed,
        },
      }
    }

    case "reset": {
      return {
        ...state,
        ids: {
          ...state.ids,
          added: new Set(),
          removed: new Set(),
        },
      }
    }

    case "initialize": {
      return createImageGroupMembershipState(action.items)
    }

    default:
      return state
  }
}
