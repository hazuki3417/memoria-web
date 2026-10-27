"use client"

import type { ReactNode } from "react"
import { Loader } from "@mantine/core"
import { StateDisplay } from "@/components/StateDisplay"

type LoadingStateProps = {
  variant?: "full" | "inline"
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function LoadingState({
  variant = "full",
  title,
  description,
  action,
}: LoadingStateProps) {
  return (
    <StateDisplay
      variant={variant}
      icon={<Loader size={variant === "full" ? undefined : "sm"} />}
      title={title}
      description={description}
      action={action}
      role="status"
      loading
    />
  )
}
