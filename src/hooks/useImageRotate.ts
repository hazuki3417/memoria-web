import { imageRotateReducer } from "@/reducers";
import { useCallback, useReducer } from "react";

export type UseImageRotateState = {
  angle: number;
  initial: {
    angle: number;
  };
  meta: { action: "left" | "right" | "reset" | "idle" };
};

export type UseImageRotateOption = Pick<UseImageRotateState, "angle">;

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
    current: { angle: option.angle },
    initial: { angle: option.angle },
    meta: { action: "idle" },
  });

  const right = useCallback(() => {
    dispatch({ type: "right" });
  }, [state.current.angle]);

  const left = useCallback(() => {
    dispatch({ type: "left" });
  }, [state.current.angle]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return {
    state: {
      angle: state.current.angle,
      initial: {
        angle: state.initial.angle,
      },
      meta: { action: state.meta.action } as const,
    },
    handler: {
      left,
      right,
      reset,
    },
  };
};
