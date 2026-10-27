"use client"

import type { ReactNode } from "react"
import { Button } from "@mantine/core"
import { IconAlertCircle } from "@tabler/icons-react"
import { StateDisplay } from "@/components/StateDisplay"

type ErrorStateProps = {
  variant?: "full" | "inline"
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  iconColor?: string
  /** 旧呼び出し元との互換性。新規利用ではactionを指定する。 */
  onRetry?: () => void
}

export function ErrorState({
  variant = "full",
  icon,
  title,
  description,
  action,
  iconColor = "red",
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
      icon={icon ?? <IconAlertCircle size={variant === "full" ? 24 : 14} />}
      title={title}
      description={description}
      action={action ?? retryAction}
      iconColor={iconColor}
      role="alert"
    />
  )
}
