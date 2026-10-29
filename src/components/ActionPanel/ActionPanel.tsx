import type { ComponentPropsWithoutRef } from "react"
import cx from "clsx"
import styles from "./ActionPanel.module.css"

type SlotProps = ComponentPropsWithoutRef<"div">

function ActionPanelRoot({ className, ...props }: SlotProps) {
  return <div className={cx(styles.root, className)} {...props} />
}

function Start({ className, ...props }: SlotProps) {
  return <div className={cx(styles.start, className)} {...props} />
}

function Center({ className, ...props }: SlotProps) {
  return <div className={cx(styles.center, className)} {...props} />
}

function End({ className, ...props }: SlotProps) {
  return <div className={cx(styles.end, className)} {...props} />
}

export const ActionPanel = Object.assign(ActionPanelRoot, {
  Start,
  Center,
  End,
})
