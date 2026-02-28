"use client"
import "client-only"
import { useContext } from "react"
import { ImageDetailModalContext } from "./ImageDetailModalContext"

export const useImageDetailModalContext = () => {
  const context = useContext(ImageDetailModalContext)
  if (context === undefined) {
    throw new Error(
      "useImageDetailModalContext must be used within a ImageDetailModalContextProvider",
    )
  }
  return context
}
