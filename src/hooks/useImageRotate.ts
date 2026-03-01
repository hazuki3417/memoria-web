"use client"
import { imageRotateReducer } from "@/reducers"
import "client-only"
import { useCallback, useReducer } from "react"

export type UseImageRotateValue = {
  angle: number
  initial: {
    angle: number
  }
  meta: { action: "left" | "right" | "reset" | "idle" }
}

export type UseImageRotateOption = Pick<UseImageRotateValue, "angle">

export interface UseImageRotateControl {
  right: () => void
  left: () => void
}

export interface UseImageRotateAction {
  reset: () => void
}

export interface UseImageRotate {
  value: UseImageRotateValue
  control: UseImageRotateControl
  action: UseImageRotateAction
}

export const useImageRotate = (
  option: UseImageRotateOption,
): UseImageRotate => {
  const [value, dispatch] = useReducer(imageRotateReducer, {
    current: { angle: option.angle },
    initial: { angle: option.angle },
    meta: { action: "idle" },
  })

  const right = useCallback(() => {
    dispatch({ type: "right" })
  }, [value.current.angle])

  const left = useCallback(() => {
    dispatch({ type: "left" })
  }, [value.current.angle])

  const reset = useCallback(() => {
    dispatch({ type: "reset" })
  }, [])

  return {
    value: {
      angle: value.current.angle,
      initial: {
        angle: value.initial.angle,
      },
      meta: { action: value.meta.action } as const,
    },
    control: {
      left,
      right,
    },
    action: {
      reset,
    },
  }
}
