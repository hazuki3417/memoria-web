"use client"

import type { ReactNode } from "react"
import { StateDisplay } from "@/components/StateDisplay"

type EmptyStateProps = {
  variant?: "full" | "inline"
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  iconColor?: string
}

export function EmptyState({
  variant = "full",
  icon,
  title,
  description,
  action,
  iconColor,
}: EmptyStateProps) {
  return (
    <StateDisplay
      variant={variant}
      icon={icon}
      title={title}
      description={description}
      action={action}
      iconColor={iconColor}
    />
  )
}
