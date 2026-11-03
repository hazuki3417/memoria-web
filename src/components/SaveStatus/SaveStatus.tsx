import { Badge, VisuallyHidden } from "@mantine/core"
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconLoader2,
} from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"

export type SaveStatusState =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "attention"

/** Agreed Settings auto-save presentation (timers never change the save queue). */
export const SETTINGS_SAVE_STATUS_TIMING = {
  savingDelayMs: 300,
  savedDurationMs: 2000,
  savingAnnouncementMs: 2000,
} as const

export type SaveStatusProps = {
  state: SaveStatusState
  /** Enable only for meaningful transitions; avoid announcing every edit. */
  announce?: boolean
  /** Optional timing; omitted props preserve the established presentation. */
  timing?: {
    savingDelayMs?: number
    savedDurationMs?: number
    savingAnnouncementMs?: number
  }
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

export function SaveStatus({
  state,
  announce = false,
  timing,
}: SaveStatusProps) {
  const [visibleState, setVisibleState] = useState<SaveStatusState>(
    // Hide initial Saving until the agreed delay has elapsed.
    state === "saving" && (timing?.savingDelayMs ?? 0) > 0 ? "idle" : state,
  )
  const savingDelay = timing?.savingDelayMs ?? 0
  const savedDuration = timing?.savedDurationMs ?? 0
  const savingAnnouncementDelay = timing?.savingAnnouncementMs

  useEffect(() => {
    if (state === "saving" && savingDelay > 0) {
      // Do not leave a previous Saved badge visible during a new write.
      setVisibleState("idle")
      const timer = setTimeout(() => setVisibleState("saving"), savingDelay)
      return () => clearTimeout(timer)
    }
    setVisibleState(state)
    if (state === "saved" && savedDuration > 0) {
      const timer = setTimeout(() => setVisibleState("idle"), savedDuration)
      return () => clearTimeout(timer)
    }
  }, [state, savingDelay, savedDuration])

  const label = labels[visibleState]
  const previousState = useRef<SaveStatusState | null>(null)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    const previous = previousState.current
    previousState.current = state
    if (!announce) {
      setAnnouncement("")
      return
    }
    if (state === "saving" && savingAnnouncementDelay !== undefined) {
      setAnnouncement("")
      const timer = setTimeout(
        () => setAnnouncement("保存中です"),
        savingAnnouncementDelay,
      )
      return () => clearTimeout(timer)
    }
    // Persistent form alerts own failure announcements.
    if (previous !== null && state === "saved" && previous !== "saved") {
      setAnnouncement("変更を保存しました")
      // Keep the live region quiet after the short confirmation window.
      if (savedDuration > 0) {
        const timer = setTimeout(() => setAnnouncement(""), savedDuration)
        return () => clearTimeout(timer)
      }
      return
    }
    setAnnouncement("")
  }, [announce, state, savingAnnouncementDelay, savedDuration])

  const Icon = visibleState === "idle" ? null : icons[visibleState]

  return (
    <>
      <Badge
        variant="light"
        color={
          visibleState === "attention"
            ? "red"
            : visibleState === "saved"
              ? "green"
              : "gray"
        }
        size="sm"
        radius="xl"
        leftSection={Icon ? <Icon size={13} aria-hidden="true" /> : undefined}
        style={{ visibility: visibleState === "idle" ? "hidden" : "visible" }}
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
