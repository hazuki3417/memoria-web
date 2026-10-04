import type { ComponentType } from "react"

export type ApplicationContextOption = {
  id: string
  kind: "personal" | "community"
  label: string
  accentColor: string
}

export type ApplicationNavigationItem = {
  id: string
  label: string
  icon: ComponentType<{
    size?: number
    stroke?: number
    "aria-hidden"?: boolean
  }>
  active?: boolean
  disabled?: boolean
}
