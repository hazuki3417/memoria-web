import { Group, Text } from "@mantine/core"
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
  /** Announcements should be enabled only for meaningful, throttled transitions. */
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
    <Group
      gap={4}
      justify="flex-end"
      wrap="nowrap"
      style={{
        width: "100%",
        visibility: state === "idle" ? "hidden" : "visible",
        whiteSpace: "nowrap",
      }}
      role={announce && state !== "idle" ? "status" : undefined}
      aria-live={announce && state !== "idle" ? "polite" : "off"}
      aria-label={label || undefined}
    >
      {Icon && (
        <Icon
          size={16}
          aria-hidden="true"
          color={state === "attention" ? "var(--mantine-color-red-6)" : "currentColor"}
        />
      )}
      <Text size="xs" c={state === "attention" ? "red" : "dimmed"}>
        {label}
      </Text>
    </Group>
  )
}
