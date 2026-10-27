"use client"

import type { ReactNode } from "react"
import { Button } from "@mantine/core"
import { IconAlertCircle } from "@tabler/icons-react"
import { StateDisplay } from "@/components/StateDisplay"

type ErrorStateProps = {
  variant?: "full" | "inline"
  title: string
  description?: ReactNode
  action?: ReactNode
  onRetry?: () => void
}

export function ErrorState({
  variant = "full",
  title,
  description,
  action,
  onRetry,
}: ErrorStateProps) {
  const retryAction = onRetry ? (
    <Button size={variant === "inline" ? "xs" : undefined} variant="default" onClick={onRetry}>
      再試行
    </Button>
  ) : undefined

  return (
    <StateDisplay
      variant={variant}
      icon={<IconAlertCircle size={variant === "full" ? 24 : 14} />}
      title={title}
      description={description}
      action={action ?? retryAction}
      iconColor="red"
      role="alert"
    />
  )
}
