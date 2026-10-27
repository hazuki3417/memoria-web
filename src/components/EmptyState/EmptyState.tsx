"use client"

import type { ReactNode } from "react"
import { StateDisplay } from "@/components/StateDisplay"

type EmptyStateProps = {
  variant?: "full" | "inline"
  icon?: ReactNode
  iconColor?: string
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({
  variant = "full",
  icon,
  iconColor,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <StateDisplay
      variant={variant}
      icon={icon}
      iconColor={iconColor}
      title={title}
      description={description}
      action={action}
    />
  )
}
