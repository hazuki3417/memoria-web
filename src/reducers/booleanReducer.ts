import { assertUnreachableActionType } from "./util"

export interface BooleanValue {
  current: boolean
  initial: boolean
}

export type BooleanAction =
  | { type: "true" }
  | { type: "false" }
  | { type: "toggle" }
  | { type: "reset" }

export const booleanReducer = (
  value: BooleanValue,
  action: BooleanAction,
): BooleanValue => {
  switch (action.type) {
    case "true":
      return { ...value, current: true }
    case "false":
      return { ...value, current: false }
    case "toggle":
      return { ...value, current: !value.current }
    case "reset":
      return { ...value, current: value.initial }
    default:
      throw assertUnreachableActionType(action)
  }
}
