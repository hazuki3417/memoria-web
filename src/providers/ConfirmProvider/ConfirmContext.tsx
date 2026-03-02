"use client"
import "client-only"
import React, { createContext } from "react"

export const confirmResult = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  DISMISSED: "dismissed",
} as const

export type ConfirmResult = (typeof confirmResult)[keyof typeof confirmResult]

export type ConfirmPayload = {
  title?: React.ReactNode
  body?: React.ReactNode
}

export const defaultConfirmPayload: Required<ConfirmPayload> = {
  title: "確認",
  body: "実行しますか？",
}

export type ConfirmValue = {
  payload: ConfirmPayload | null
}

export interface ConfirmControl {
  confirm: () => void
  cancel: () => void
  dismiss: () => void
}

export interface ConfirmAction {
  confirm: (args?: ConfirmPayload) => Promise<ConfirmResult>
}

export interface ConfirmContextValue {
  value: ConfirmValue
  control: ConfirmControl
  action: ConfirmAction
}

export const ConfirmContext = createContext<ConfirmContextValue | undefined>(
  undefined,
)
