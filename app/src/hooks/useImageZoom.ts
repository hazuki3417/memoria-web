import { numberReducer } from "@/reducers";
import { useCallback, useReducer } from "react";

export type UseImageZoomState = {
  level: number; // 倍率
  scale: number; // スケール
  initial: {
    level: number;
  };
  config: {
    step: number;
    min: number;
    max: number;
  };
};

export type UseImageZoomOption = Pick<UseImageZoomState, "level" | "config">;

export interface UseImageZoomHandler {
  zoomIn: () => void;
  zoomOut: () => void;
  set: (level: number) => void;
  reset: () => void;
}

export interface UseImageZoom {
  state: UseImageZoomState;
  handler: UseImageZoomHandler;
}

export const useImageZoom = (option: UseImageZoomOption): UseImageZoom => {
  const [state, dispatch] = useReducer(numberReducer, {
    current: { value: option.level },
    initial: { value: option.level },
    config: option.config,
  });

  const zoomIn = useCallback(() => {
    const candidate = state.current.value + state.config.step;
    const clamped = clamp(candidate, option.config.min, option.config.max);
    dispatch({ type: "set", value: clamped });
  }, [state.current.value, option.config]);

  const zoomOut = useCallback(() => {
    const candidate = state.current.value - state.config.step;
    const clamped = clamp(candidate, option.config.min, option.config.max);
    dispatch({ type: "set", value: clamped });
  }, [state.current.value, option.config]);

  const set = useCallback(
    (level: number) => {
      const clamped = clamp(level, option.config.min, option.config.max);
      dispatch({ type: "set", value: clamped });
    },
    [option.config],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return {
    state: {
      level: state.current.value,
      scale: state.current.value,
      initial: {
        level: state.initial.value,
      },
      config: option.config,
    },
    handler: {
      zoomIn,
      zoomOut,
      set,
      reset,
    },
  };
};

const clamp = (level: number, min: number, max: number): number => {
  return Math.max(min, Math.min(level, max));
};
