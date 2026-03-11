"use client"
import type React from "react"

export interface ProvidersProps {
  children: React.ReactNode
}

export const Providers = (props: ProvidersProps) => {
  const { children } = props
  return <>{children}</>
}
