"use client"
import "client-only"
import React, { useCallback, useRef, useState } from "react"
import {
  CONFIRM_RESULT,
  ConfirmContext,
  ConfirmPayload,
  ConfirmResult,
  defaultConfirmPayload,
} from "./ConfirmContext"

export interface ConfirmProviderProps {
  children: React.ReactNode
}

export const ConfirmProvider = (props: ConfirmProviderProps) => {
  const { children } = props

  const [payload, setPayload] = useState<ConfirmPayload | null>(null)
  const resolveRef = useRef<(result: ConfirmResult) => void | null>(null)

  const confirm = (args?: ConfirmPayload) => {
    return new Promise<ConfirmResult>((resolve) => {
      if (resolveRef.current) {
        resolveRef.current(CONFIRM_RESULT.DISMISSED)
      }
      resolveRef.current = resolve

      const normalized: ConfirmPayload = {
        ...defaultConfirmPayload,
        ...args,
      }

      setPayload(normalized)
    })
  }

  const close = (result: ConfirmResult) => {
    resolveRef.current?.(result)
    resolveRef.current = null
    setPayload(null)
  }

  const handleConfirm = useCallback(() => {
    close(CONFIRM_RESULT.CONFIRMED)
  }, [])

  const handleCancel = useCallback(() => {
    close(CONFIRM_RESULT.CANCELLED)
  }, [])

  const handelDismiss = useCallback(() => {
    close(CONFIRM_RESULT.DISMISSED)
  }, [])

  return (
    <ConfirmContext.Provider
      value={{
        value: { payload },
        control: {
          confirm: handleConfirm,
          cancel: handleCancel,
          dismiss: handelDismiss,
        },
        action: { confirm },
      }}
    >
      {children}
    </ConfirmContext.Provider>
  )
}
