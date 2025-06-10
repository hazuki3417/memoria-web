import { imageRotateReducer } from "@/reducers/imageRotateReducer";
import { useCallback, useReducer } from "react";

export type UseImageRotateState = {
  value: number;
  initial: {
    value: number;
  };
};

export type UseImageRotateOption = Pick<UseImageRotateState, "value">;

export interface UseImageRotateHandler {
  right: () => void;
  left: () => void;
  reset: () => void;
}

export interface UseImageRotate {
  state: UseImageRotateState;
  handler: UseImageRotateHandler;
}

export const useImageRotate = (
  option: UseImageRotateOption,
): UseImageRotate => {
  const [state, dispatch] = useReducer(imageRotateReducer, {
    current: { value: option.value },
    initial: { value: option.value },
  });

  const right = useCallback(() => {
    dispatch({ type: "right" });
  }, [state.current.value]);

  const left = useCallback(() => {
    dispatch({ type: "left" });
  }, [state.current.value]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return {
    state: {
      value: state.current.value,
      initial: {
        value: state.initial.value,
      },
    },
    handler: {
      left,
      right,
      reset,
    },
  };
};
