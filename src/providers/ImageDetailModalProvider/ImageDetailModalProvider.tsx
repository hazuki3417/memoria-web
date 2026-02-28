"use client"
import { useDisclosure } from "@/hooks"
import "client-only"
import React, { useCallback, useState } from "react"
import {
  ImageDetailModalContext,
  ImageDetailModalPayload,
} from "./ImageDetailModalContext"

export interface ImageDetailModalProviderProps {
  children: React.ReactNode
}

export const ImageDetailModalProvider = (
  props: ImageDetailModalProviderProps,
) => {
  const { children } = props

  const disclosure = useDisclosure({ status: "closed" })
  const [payload, setPayload] = useState<ImageDetailModalPayload | null>(null)

  const handleOpen = useCallback(() => {
    disclosure.control.open()
  }, [disclosure])

  return (
    <ImageDetailModalContext.Provider
      value={{
        value: { modal: { opened: disclosure.value.status }, payload },
        control: {
          open: handleOpen,
          close: disclosure.control.close,
        },
        action: {},
      }}
    >
      {children}
    </ImageDetailModalContext.Provider>
  )
}
