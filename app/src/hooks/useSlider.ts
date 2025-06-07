import { numberReducer } from "@/reducers";
import { useCallback, useReducer } from "react";

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

export type UseSliderState = {
  value: number;
  initial: {
    value: number;
  };
  config: {
    step: number;
    min: number;
    max: number;
  };
};

export type UseSliderOption = Pick<UseSliderState, "value" | "config">;

export interface UseSliderHandler {
  up: () => void;
  down: () => void;
  change: (value: number) => void;
  reset: () => void;
}

export interface UseSlider {
  state: UseSliderState;
  handler: UseSliderHandler;
}

export const useSlider = (option: UseSliderOption): UseSlider => {
  const [state, dispatch] = useReducer(numberReducer, {
    current: { value: option.value },
    initial: { value: option.value },
    config: option.config,
  });

  const up = useCallback(() => {
    const candidate = state.current.value + state.config.step;
    const clamped = clamp(candidate, option.config.min, option.config.max);
    dispatch({ type: "set", value: clamped });
  }, [state.current.value, option.config]);

  const down = useCallback(() => {
    const candidate = state.current.value - state.config.step;
    const clamped = clamp(candidate, option.config.min, option.config.max);
    dispatch({ type: "set", value: clamped });
  }, [state.current.value, option.config]);

  const change = useCallback(
    (value: number) => {
      const clamped = clamp(value, option.config.min, option.config.max);
      dispatch({ type: "set", value: clamped });
    },
    [option.config],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return {
    state: {
      value: state.current.value,
      initial: {
        value: state.initial.value,
      },
      config: option.config,
    },
    handler: {
      up,
      down,
      change,
      reset,
    },
  };
};
