"use client"
import "client-only"
import { useContext } from "react"
import { FeedbackContext, FeedbackContextValue } from "./FeedbackContext"

export const useFeedbackContext = (): FeedbackContextValue => {
  const ctx = useContext(FeedbackContext)
  if (!ctx) {
    throw new Error("useFeedbackContext must be used within FeedbackContext")
  }
  return ctx
}
