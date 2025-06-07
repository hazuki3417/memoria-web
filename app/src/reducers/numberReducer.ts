import { assertUnreachableActionType } from "./util";

export interface NumberState {
  current: {
    value: number;
  };
  initial: {
    value: number;
  };
  config: {
    step: number;
  };
}

export type NumberAction = { type: "set"; value: number } | { type: "reset" };

export const numberReducer = (
  state: NumberState,
  action: NumberAction,
): NumberState => {
  switch (action.type) {
    case "set":
      return {
        ...state,
        current: {
          value: action.value,
        },
      };
    case "reset":
      return {
        ...state,
        current: {
          value: state.initial.value,
        },
      };
    default:
      throw assertUnreachableActionType(action);
  }
};
