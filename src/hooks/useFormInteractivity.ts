"use client"
import "client-only"
import { useMemo } from "react"

export interface FormInteractivity {
  disabled?: boolean
  readOnly?: boolean
}

export type ActionState = {
  loading?: boolean
  error?: any
}

type UseFormInteractivityOption = {
  read: ActionState
  write: ActionState
}

export const useFormInteractivity = ({
  read,
  write,
}: UseFormInteractivityOption): FormInteractivity => {
  const disabled = useMemo(() => {
    if (read.loading) return true
    if (read.error !== undefined) return true
    if (write.loading) return true
    return false
  }, [read, write])

  const readOnly = useMemo(() => {
    if (read.loading) return true
    if (read.error !== undefined) return true
    if (write.loading) return true
    return false
  }, [read, write])

  return { disabled, readOnly }
}

export const extractInteractivity = <T extends Partial<FormInteractivity>>(
  props: T,
): FormInteractivity => {
  const { disabled = false, readOnly = false } = props
  return { disabled, readOnly }
}
