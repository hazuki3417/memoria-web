import { numberReducer } from "@/reducers";
import { useCallback, useReducer } from "react";

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

export type UseSliderState = {
  value: number;
  config: {
    step: number;
    min: number;
    max: number;
  };
};

export type UseSliderHandler = {
  up: () => void;
  down: () => void;
  change: (value: number) => void;
  reset: () => void;
};
export interface UseSlider {
  state: UseSliderState;
  handler: UseSliderHandler;
}

export const useSlider = (initial: UseSliderState): UseSlider => {
  const [state, dispatch] = useReducer(numberReducer, {
    current: { value: initial.value },
    initial: { value: initial.value },
    config: {
      step: initial.config.step,
    },
  });

  const up = useCallback(() => {
    const candidate = state.current.value + state.config.step;
    const clamped = clamp(candidate, initial.config.min, initial.config.max);
    dispatch({ type: "set", value: clamped });
  }, [state.current.value, initial.config]);

  const down = useCallback(() => {
    const candidate = state.current.value - state.config.step;
    const clamped = clamp(candidate, initial.config.min, initial.config.max);
    dispatch({ type: "set", value: clamped });
  }, [state.current.value, initial.config]);

  const change = useCallback(
    (value: number) => {
      const clamped = clamp(value, initial.config.min, initial.config.max);
      dispatch({ type: "set", value: clamped });
    },
    [initial.config],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return {
    state: {
      value: state.current.value,
      config: initial.config,
    },
    handler: {
      up,
      down,
      change,
      reset,
    },
  };
};
