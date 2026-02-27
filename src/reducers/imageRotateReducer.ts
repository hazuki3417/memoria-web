import { ActionType, assertUnreachableActionType } from "./util"

export type ImageRotateActionType = "left" | "right" | "reset"
export interface ImageRotateState {
  current: {
    angle: number
  }
  initial: {
    angle: number
  }
  meta: {
    action: ActionType<ImageRotateActionType>
  }
}

export type ImageRotateAction =
  | { type: "left" }
  | { type: "right" }
  | { type: "reset" }

export const imageRotateReducer = (
  state: ImageRotateState,
  action: ImageRotateAction,
): ImageRotateState => {
  switch (action.type) {
    case "left":
      return {
        ...state,
        current: { angle: state.current.angle - 90 },
        meta: { action: "left" },
      }
    case "right":
      return {
        ...state,
        current: { angle: state.current.angle + 90 },
        meta: { action: "left" },
      }
    case "reset":
      return {
        ...state,
        current: { angle: state.initial.angle },
        meta: { action: "reset" },
      }
    default:
      throw assertUnreachableActionType(action)
  }
}
