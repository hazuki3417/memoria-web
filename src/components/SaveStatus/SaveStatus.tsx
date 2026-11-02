import { Badge, VisuallyHidden } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconLoader2,
} from "@tabler/icons-react"

export type SaveStatusState =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "attention"

export type SaveStatusProps = {
  state: SaveStatusState
  /** Enable only for meaningful transitions; avoid announcing every edit. */
  announce?: boolean
}

const labels: Record<SaveStatusState, string> = {
  idle: "",
  pending: "保存待ち",
  saving: "保存中",
  saved: "保存済み",
  attention: "要確認",
}

const icons = {
  pending: IconClock,
  saving: IconLoader2,
  saved: IconCheck,
  attention: IconAlertCircle,
}

export function SaveStatus({ state, announce = false }: SaveStatusProps) {
  const label = labels[state]
  const previousState = useRef<SaveStatusState | null>(null)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    const previous = previousState.current
    previousState.current = state
    // Error announcements belong to the persistent form alert.
    // Avoid announcing every edit or an initial saved state.
    if (!announce || previous === null || state !== "saved" || previous === "saved") {
      setAnnouncement("")
      return
    }
    setAnnouncement("変更を保存しました")
  }, [announce, state])
  const Icon = state === "idle" ? null : icons[state]

  return (
    <>
      <Badge
      variant="light"
      color={state === "attention" ? "red" : state === "saved" ? "green" : "gray"}
      size="sm"
      radius="xl"
      leftSection={Icon ? <Icon size={13} aria-hidden="true" /> : undefined}
      style={{ visibility: state === "idle" ? "hidden" : "visible" }}
      aria-live="off"
      aria-label={label || undefined}
    >
      {label || "保存済み"}
      </Badge>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
    </>
  )
}
