"use client"

import { Alert, type AlertProps } from "@mantine/core"
import type { ReactNode } from "react"
import { feedbackAppearance, icons, type FeedbackKind } from "../feedbackAppearance"

export function FeedbackAlert({
  kind,
  title,
  children,
  ...props
}: Omit<AlertProps, "color" | "icon" | "title"> & {
  kind: FeedbackKind
  title: string
  children: ReactNode
}) {
  const Icon = icons[kind]
  const appearance = feedbackAppearance(kind)

  return (
    <Alert
      {...props}
      color={appearance.color}
      title={title}
      icon={<Icon size={18} />}
      styles={{
        root: { backgroundColor: appearance.backgroundColor },
      }}
    >
      {children}
    </Alert>
  )
}

