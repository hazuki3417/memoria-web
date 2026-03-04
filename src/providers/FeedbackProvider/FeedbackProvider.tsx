"use client"
import { useCallback, useRef } from "react"
import {
  FEEDBACK_KIND,
  FeedbackContext,
  FeedbackEvent,
  FeedbackKind,
  FeedbackPayload,
} from "./FeedbackContext"

export interface FeedbackProviderProps {
  children: React.ReactNode
}

export const FeedbackProvider = (props: FeedbackProviderProps) => {
  const { children } = props

  const ref = useRef(new Set<(event: FeedbackEvent) => void>())

  const emit = useCallback((kind: FeedbackKind, payload?: FeedbackPayload) => {
    const event: FeedbackEvent = {
      id: crypto.randomUUID(),
      kind,
      payload,
    }

    ref.current.forEach((listener) => {
      listener(event)
    })
  }, [])

  const subscribe = useCallback((listener: (event: FeedbackEvent) => void) => {
    ref.current.add(listener)
    return () => {
      ref.current.delete(listener)
    }
  }, [])

  const success = useCallback((args?: FeedbackPayload) => {
    emit(FEEDBACK_KIND.SUCCESS, args)
  }, [])

  const info = useCallback((args?: FeedbackPayload) => {
    emit(FEEDBACK_KIND.INFO, args)
  }, [])

  const warning = useCallback((args?: FeedbackPayload) => {
    emit(FEEDBACK_KIND.WARNING, args)
  }, [])

  const error = useCallback((args?: FeedbackPayload) => {
    emit(FEEDBACK_KIND.ERROR, args)
  }, [])

  return (
    <FeedbackContext.Provider
      value={{
        control: { subscribe },
        action: {
          success,
          info,
          warning,
          error,
        },
      }}
    >
      {children}
    </FeedbackContext.Provider>
  )
}
