import { IconAlertCircle, IconAlertTriangle, IconCheck, IconInfoCircle } from "@tabler/icons-react"

export type FeedbackKind = "success" | "info" | "warning" | "error"

const colors: Record<FeedbackKind, string> = {
  success: "green",
  info: "blue",
  warning: "yellow",
  error: "red",
}

export const icons = {
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

