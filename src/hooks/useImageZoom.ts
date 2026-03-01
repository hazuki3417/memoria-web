import { numberReducer } from "@/reducers"
import { useCallback, useMemo, useReducer } from "react"

export type UseImageZoomValue = {
  level: number // 倍率
  scale: number // スケール
  initial: {
    level: number
  }
  config: {
    step: number
    min: number
    max: number
  }
}

export type UseImageZoomOption = Pick<UseImageZoomValue, "level" | "config">

export interface UseImageZoomControl {
  zoomIn: () => void
  zoomOut: () => void
}

export interface UseImageZoomAction {
  set: (level: number) => void
  reset: () => void
}

export interface UseImageZoom {
  value: UseImageZoomValue
  control: UseImageZoomControl
  action: UseImageZoomAction
}

export const useImageZoom = (option: UseImageZoomOption): UseImageZoom => {
  const [value, dispatch] = useReducer(numberReducer, {
    current: { value: option.level },
    initial: { value: option.level },
    config: option.config,
  })

  // NOTE: zoom levelを監視して常にscaleを計算する
  const scale = useMemo(() => {
    return value.current.value / 100
  }, [value.current.value])

  const zoomIn = useCallback(() => {
    const candidate = value.current.value + value.config.step
    const clamped = clamp(candidate, option.config.min, option.config.max)
    dispatch({ type: "set", value: clamped })
  }, [value.current.value, option.config])

  const zoomOut = useCallback(() => {
    const candidate = value.current.value - value.config.step
    const clamped = clamp(candidate, option.config.min, option.config.max)
    dispatch({ type: "set", value: clamped })
  }, [value.current.value, option.config])

  const set = useCallback(
    (level: number) => {
      const clamped = clamp(level, option.config.min, option.config.max)
      dispatch({ type: "set", value: clamped })
    },
    [option.config],
  )

  const reset = useCallback(() => {
    dispatch({ type: "reset" })
  }, [])

  return {
    value: {
      level: value.current.value,
      scale,
      initial: {
        level: value.initial.value,
      },
      config: option.config,
    },
    control: {
      zoomIn,
      zoomOut,
    },
    action: {
      set,
      reset,
    },
  }
}

const clamp = (level: number, min: number, max: number): number => {
  return Math.max(min, Math.min(level, max))
}
