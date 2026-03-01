"use client"
import { booleanReducer } from "@/reducers"
import "client-only"
import { useCallback, useReducer } from "react"

export type UseBooleanOption = boolean

export type UseBooleanValue = boolean

// export interface UseBooleanControl {
// }

export interface UseBooleanAction {
  setTrue: () => void
  setFalse: () => void
  toggle: () => void
  reset: () => void
}

export interface UseBoolean {
  value: UseBooleanValue
  // control: UseBooleanControl
  action: UseBooleanAction
}

export const useBoolean = (option: UseBooleanOption): UseBoolean => {
  const [state, dispatch] = useReducer(booleanReducer, {
    current: option,
    initial: option,
  })

  const setTrue = useCallback(() => dispatch({ type: "true" }), [])
  const setFalse = useCallback(() => dispatch({ type: "false" }), [])
  const toggle = useCallback(() => dispatch({ type: "toggle" }), [])
  const reset = useCallback(() => dispatch({ type: "reset" }), [])

  return {
    value: state.current,
    action: {
      setTrue,
      setFalse,
      toggle,
      reset,
    },
  }
}
