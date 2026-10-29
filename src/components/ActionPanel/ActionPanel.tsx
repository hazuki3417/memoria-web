import type { ComponentPropsWithoutRef } from "react"
import styles from "./ActionPanel.module.css"

type SlotProps = ComponentPropsWithoutRef<"div">

function ActionPanelRoot({ className, ...props }: SlotProps) {
  return <div className={[styles.root, className].filter(Boolean).join(" ")} {...props} />
}

function Start({ className, ...props }: SlotProps) {
  return <div className={[styles.start, className].filter(Boolean).join(" ")} {...props} />
}

function Center({ className, ...props }: SlotProps) {
  return <div className={[styles.center, className].filter(Boolean).join(" ")} {...props} />
}

function End({ className, ...props }: SlotProps) {
  return <div className={[styles.end, className].filter(Boolean).join(" ")} {...props} />
}

export const ActionPanel = Object.assign(ActionPanelRoot, {
  Start,
  Center,
  End,
})
