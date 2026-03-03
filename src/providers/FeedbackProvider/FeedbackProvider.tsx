"use client"
import { useCallback, useState } from "react"
import {
  FEEDBACK_KIND,
  FeedbackContext,
  FeedbackKind,
  FeedbackPayload,
  FeedbackValue,
} from "./FeedbackContext"

export interface FeedbackProviderProps {
  children: React.ReactNode
}

export const FeedbackProvider = (props: FeedbackProviderProps) => {
  const { children } = props

  // TODO(architecture):
  // 通知は一過性イベントのため、本来はstateではなくイベント駆動で扱うべき。
  // Mantineとの疎結合は維持しつつ、将来的にPub/Sub型へ改善を検討する。
  const [value, setValue] = useState<FeedbackValue>({
    kind: null,
    payload: null,
  })

  const feedback = (kind: FeedbackKind, args?: FeedbackPayload) => {
    const normalized: FeedbackPayload = {
      ...args,
    }

    setValue({
      kind,
      payload: { ...normalized },
    })
  }

  const close = () => {
    if (value.payload !== null) {
      value.payload.onOk?.()
    }
    setValue({ kind: null, payload: null })
  }

  const success = useCallback((args?: FeedbackPayload) => {
    feedback(FEEDBACK_KIND.SUCCESS, args)
  }, [])

  const info = useCallback((args?: FeedbackPayload) => {
    feedback(FEEDBACK_KIND.INFO, args)
  }, [])

  const warning = useCallback((args?: FeedbackPayload) => {
    feedback(FEEDBACK_KIND.WARNING, args)
  }, [])

  const error = useCallback((args?: FeedbackPayload) => {
    feedback(FEEDBACK_KIND.ERROR, args)
  }, [])

  return (
    <FeedbackContext.Provider
      value={{
        value,
        control: { close },
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
