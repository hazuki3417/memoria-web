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

export type PrototypeFeedbackKind = "success" | "info" | "warning" | "error"

const colors: Record<PrototypeFeedbackKind, string> = {
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

function feedbackAppearance(kind: PrototypeFeedbackKind) {
  const color = colors[kind]
  return {
    color,
    backgroundColor: `color-mix(in srgb, var(--mantine-color-${color}-6) 7%, var(--mantine-color-body))`,
  }
}

export function PrototypeFormAlert({
  kind,
  title,
  children,
  ...props
}: Omit<AlertProps, "color" | "icon" | "title"> & {
  kind: PrototypeFeedbackKind
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

export function showPrototypeNotification({
  kind,
  title,
  message,
}: {
  kind: PrototypeFeedbackKind
  title: string
  message: string
}) {
  const appearance = feedbackAppearance(kind)
  const Icon = icons[kind]
  notifications.show({
    message: (
      <Alert
        color={appearance.color}
        title={title}
        icon={<Icon size={18} />}
        styles={{
          root: {
            backgroundColor: appearance.backgroundColor,
            paddingRight: 40,
          },
          title: { fontSize: 14 },
          message: { fontSize: 12 },
        }}
      >
        {message}
      </Alert>
    ),
    withCloseButton: true,
    styles: {
      root: {
        padding: 0,
        border: 0,
        background: "var(--mantine-color-body)",
        boxShadow: "none",
      },
      body: { margin: 0 },
      description: { margin: 0 },
      closeButton: { position: "absolute", top: 8, right: 8, zIndex: 1 },
    },
  })
}
