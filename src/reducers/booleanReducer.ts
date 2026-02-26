import { assertUnreachableActionType } from "./util";

export interface BooleanState {
  current: {
    value: boolean;
  };
  initial: {
    value: boolean;
  };
}

export type BooleanAction =
  | { type: "true" }
  | { type: "false" }
  | { type: "toggle" }
  | { type: "reset" };

export const booleanReducer = (
  state: BooleanState,
  action: BooleanAction,
): BooleanState => {
  switch (action.type) {
    case "true":
      return { ...state, current: { value: true } };
    case "false":
      return { ...state, current: { value: false } };
    case "toggle":
      return { ...state, current: { value: !state.current.value } };
    case "reset":
      return { ...state, current: { value: state.initial.value } };
    default:
      throw assertUnreachableActionType(action);
  }
};
