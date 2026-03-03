"use client"
import "client-only"

import React, { createContext } from "react"

export const FEEDBACK_KIND = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const

export type FeedbackKind = (typeof FEEDBACK_KIND)[keyof typeof FEEDBACK_KIND]

export type FeedbackPayload = {
  title?: React.ReactNode
  body?: React.ReactNode
  onOk?: () => void
}

export type FeedbackValue = {
  kind: FeedbackKind | null
  payload: FeedbackPayload | null
}

export interface FeedbackControl {
  close: () => void
}

export interface FeedbackAction {
  success: (args: FeedbackPayload) => void
  error: (args: FeedbackPayload) => void
  warning: (args: FeedbackPayload) => void
  info: (args: FeedbackPayload) => void
}

export interface FeedbackContextValue {
  value: FeedbackValue
  control: FeedbackControl
  action: FeedbackAction
}

export const FeedbackContext = createContext<FeedbackContextValue | undefined>(
  undefined,
)
