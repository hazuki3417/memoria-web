import { createContext, useContext } from "react"

export interface UseFormContext {
  formId: string
}

export const FormContext = createContext<UseFormContext | null>(null)

export const useFormContext = (): UseFormContext => {
  const ctx = useContext(FormContext)
  if (!ctx) {
    throw new Error("useFormContext must be used within FormContext")
  }
  return ctx
}
