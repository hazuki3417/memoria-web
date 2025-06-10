import { assertUnreachableActionType } from "./util";

export interface ImageRotateState {
  current: {
    value: number;
  };
  initial: {
    value: number;
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
      return { ...state, current: { value: state.current.value - 90 } };
    case "right":
      return { ...state, current: { value: state.current.value + 90 } };
    case "reset":
      return { ...state, current: { value: state.initial.value } };
    default:
      throw assertUnreachableActionType(action);
  }
};
