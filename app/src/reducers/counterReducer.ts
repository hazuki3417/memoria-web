import { assertUnreachableActionType } from "./util";

export interface CounterState {
  current: {
    value: number;
  };
  initial: {
    value?: number;
  };
  config: {
    step?: number;
    min?: number;
    max?: number;
  };
}

export type CounterAction =
  | { type: "increment"; step?: number }
  | { type: "decrement"; step?: number }
  | { type: "set"; value: number }
  | { type: "reset" };

export interface CounterResult {
  value: number;
  success: boolean;
}

export const DEFAULT = {
  INITIAL: {
    VALUE: 0,
  },
  CONFIG: {
    MIN: Number.MIN_SAFE_INTEGER,
    MAX: Number.MAX_SAFE_INTEGER,
    STEP: 1,
  },
};

export const counterReducer = (
  state: CounterState,
  action: CounterAction,
): CounterResult => {
  const increment = (step: number): CounterResult => {
    const value = state.current.value + step;
    const min = state.config.min ?? DEFAULT.CONFIG.MIN;
    const max = state.config.max ?? DEFAULT.CONFIG.MAX;
    const success = min <= value && value <= max;
    return {
      value: success ? value : state.current.value,
      success,
    };
  };

  const decrement = (step: number): CounterResult => {
    const value = state.current.value - step;
    const min = state.config.min ?? DEFAULT.CONFIG.MIN;
    const max = state.config.max ?? DEFAULT.CONFIG.MAX;
    const success = min <= value && value <= max;
    return {
      value: success ? value : state.current.value,
      success,
    };
  };

  const set = (value: number): CounterResult => {
    const min = state.config.min ?? DEFAULT.CONFIG.MIN;
    const max = state.config.max ?? DEFAULT.CONFIG.MAX;
    const success = min <= value && value <= max;
    return {
      value: success ? value : state.current.value,
      success,
    };
  };

  switch (action.type) {
    case "increment":
      return increment(action.step ?? DEFAULT.CONFIG.STEP);
    case "decrement":
      return decrement(action.step ?? DEFAULT.CONFIG.STEP);
    case "set":
      return set(action.value);
    case "reset":
      return {
        value: state.initial.value ?? DEFAULT.INITIAL.VALUE,
        success: true,
      };
    default:
      throw assertUnreachableActionType(action);
  }
};
