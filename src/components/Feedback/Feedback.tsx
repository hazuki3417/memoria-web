"use client"

import { Alert } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import {
  feedbackAppearance,
  icons,
  type FeedbackKind,
} from "./feedbackAppearance"
export type { FeedbackKind } from "./feedbackAppearance"
export { FeedbackAlert } from "./FeedbackAlert"
export { FeedbackPanel } from "./FeedbackPanel"

export function showNotification({
  kind,
  title,
  description,
}: {
  kind: FeedbackKind
  title: string
  description: string
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
        {description}
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
