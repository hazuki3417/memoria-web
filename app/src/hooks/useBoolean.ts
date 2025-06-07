import { booleanReducer } from "@/reducers";
import { useCallback, useReducer } from "react";

export type UseBooleanState = boolean;

export type UseBooleanOption = UseBooleanState;

export interface UseBooleanHandler {
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
  reset: () => void;
}
export interface UseBoolean {
  state: UseBooleanState;
  handler: UseBooleanHandler;
}

export const useBoolean = (option: UseBooleanOption): UseBoolean => {
  const [state, dispatch] = useReducer(booleanReducer, {
    current: { value: option },
    initial: { value: option },
  });

  const setTrue = useCallback(() => dispatch({ type: "true" }), []);
  const setFalse = useCallback(() => dispatch({ type: "false" }), []);
  const toggle = useCallback(() => dispatch({ type: "toggle" }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return {
    state: state.current.value,
    handler: {
      setTrue,
      setFalse,
      toggle,
      reset,
    },
  };
};
