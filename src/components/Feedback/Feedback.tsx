"use client"

import { Alert, type AlertProps } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons-react"
import type { ReactNode } from "react"

export type FeedbackKind = "success" | "info" | "warning" | "error"

const colors: Record<FeedbackKind, string> = {
  success: "green",
  info: "blue",
  warning: "yellow",
  error: "red",
}

const icons = {
  success: IconCheck,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  error: IconAlertCircle,
}

function feedbackAppearance(kind: FeedbackKind) {
  const color = colors[kind]
  return {
    color,
    backgroundColor: `color-mix(in srgb, var(--mantine-color-${color}-6) 7%, var(--mantine-color-body))`,
  }
}

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

export function showNotification({
  kind,
  title,
  message,
}: {
  kind: FeedbackKind
  title: string
  message?: string
}) {
  const appearance = feedbackAppearance(kind)
  const Icon = icons[kind]

  notifications.show({
    title,
    message: message ?? "",
    color: appearance.color,
    icon: <Icon size={18} />,
    withCloseButton: true,
    styles: {
      root: {
        backgroundColor: appearance.backgroundColor,
      },
      title: { fontSize: 14 },
      description: { fontSize: 12 },
    },
  })
}
