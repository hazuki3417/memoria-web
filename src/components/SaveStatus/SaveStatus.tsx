import { Badge } from "@mantine/core"
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
  const Icon = state === "idle" ? null : icons[state]

  return (
    <Badge
      variant="light"
      color={state === "attention" ? "red" : state === "saved" ? "green" : "gray"}
      size="sm"
      radius="sm"
      leftSection={Icon ? <Icon size={13} aria-hidden="true" /> : undefined}
      style={{ visibility: state === "idle" ? "hidden" : "visible" }}
      role={announce && state !== "idle" ? "status" : undefined}
      aria-live={announce && state !== "idle" ? "polite" : "off"}
      aria-label={label || undefined}
    >
      {label || "保存済み"}
    </Badge>
  )
}
