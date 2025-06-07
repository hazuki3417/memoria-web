import { assertUnreachableActionType } from "./util";

export interface CounterState {
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

export type CounterAction =
  | { type: "increment"; step?: number }
  | { type: "decrement"; step?: number }
  | { type: "set"; value: number }
  | { type: "reset" };

export const counterReducer = (
  state: CounterState,
  action: CounterAction,
): CounterState => {
  const increment = (step: number): CounterState => {
    return {
      ...state,
      current: {
        value: state.current.value + step,
      },
    };
  };

  const decrement = (step: number): CounterState => {
    return {
      ...state,
      current: {
        value: state.current.value - step,
      },
    };
  };

  switch (action.type) {
    case "increment":
      return increment(action.step ?? state.config.step);
    case "decrement":
      return decrement(action.step ?? state.config.step);
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
