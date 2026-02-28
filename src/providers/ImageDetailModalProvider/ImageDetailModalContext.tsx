"use client"
import { UseDisclosureStatus } from "@/hooks"
import "client-only"
import { createContext } from "react"

export type ImageDetailModalPayload = {}

export interface ImageDetailModalValue {
  modal: {
    opened: UseDisclosureStatus
  }
  payload: ImageDetailModalPayload | null
}

export interface ImageDetailModalControl {
  open: () => void
  close: () => void
}

export interface ImageDetailModalAction {}

export type ImageDetailModalContext = {
  value: ImageDetailModalValue
  control: ImageDetailModalControl
  action: ImageDetailModalAction
}

export const ImageDetailModalContext = createContext<
  ImageDetailModalContext | undefined
>(undefined)
