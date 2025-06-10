import { assertUnreachableActionType } from "./util";

export interface ImageRotateState {
  current: {
    angle: number;
  };
  initial: {
    angle: number;
  };
}

export type ImageRotateAction =
  | { type: "left" }
  | { type: "right" }
  | { type: "reset" };

export const imageRotateReducer = (
  state: ImageRotateState,
  action: ImageRotateAction,
): ImageRotateState => {
  switch (action.type) {
    case "left":
      return { ...state, current: { angle: state.current.angle - 90 } };
    case "right":
      return { ...state, current: { angle: state.current.angle + 90 } };
    case "reset":
      return { ...state, current: { angle: state.initial.angle } };
    default:
      throw assertUnreachableActionType(action);
  }
};
