"use client"

import type { ReactNode } from "react"
import { Loader } from "@mantine/core"
import { StateDisplay } from "@/components/StateDisplay"

type LoadingStateProps = {
  variant?: "full" | "inline"
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  /** 既存の追加読み込み表示（横並び／縦並び）を保持。 */
  inlineLayout?: "row" | "column"
  inlinePadding?: "md" | "lg"
  inlineGap?: "xs" | number
  status?: boolean
}

export function LoadingState({
  variant = "full",
  icon,
  title,
  description,
  action,
  inlineLayout = "column",
  inlinePadding = "md",
  inlineGap,
  status = false,
}: LoadingStateProps) {
  return (
    <StateDisplay
      variant={variant}
      icon={icon ?? <Loader size={variant === "full" ? undefined : "sm"} />}
      title={title}
      description={description}
      action={action}
      role={status ? "status" : undefined}
      loading
      inlineCentered={variant === "inline"}
      inlinePadding={inlinePadding}
      inlineGap={inlineLayout === "row" ? undefined : inlineGap ?? "xs"}
    />
  )
}
