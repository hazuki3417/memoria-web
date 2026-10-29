"use client"

import { Box, Divider, Group, Modal, Stack } from "@mantine/core"
import type { ModalProps } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import styles from "./Dialog.module.css"

type DialogProps = Omit<ModalProps, "children" | "withCloseButton"> & {
  children: ReactNode
  /** Transitional support for existing consumers. Prefer Dialog.Footer as a child. */
  footer?: ReactNode
}

type RegionProps = ComponentPropsWithoutRef<"div">

function DialogRoot({ children, footer, ...props }: DialogProps) {
  return (
    <Modal {...props} centered withCloseButton={false}>
      <Box tabIndex={-1} data-autofocus style={{ position: "absolute" }} />
      <div className={styles.layout}>
        {children}
        {footer}
      </div>
    </Modal>
  )
}

function DialogBody({ className, ...props }: RegionProps) {
  return <div className={[styles.body, className].filter(Boolean).join(" ")} {...props} />
}

function DialogDivider() {
  return <Divider className={styles.divider} />
}

type LegacyFooterProps = {
  leading?: ReactNode
  secondary?: ReactNode
  primary?: ReactNode
  children?: never
}

type DialogFooterProps =
  | (RegionProps & { leading?: never; secondary?: never; primary?: never })
  | LegacyFooterProps

function DialogFooter(props: DialogFooterProps) {
  const compact = useMediaQuery("(max-width: 47.99em)")

  if ("children" in props && props.children !== undefined) {
    const { className, children, ...rest } = props
    return (
      <div className={[styles.footer, className].filter(Boolean).join(" ")} {...rest}>
        {children}
      </div>
    )
  }

  // Existing media-detail and media-browser consumers retain their layout until migrated.
  const { leading, secondary, primary } = props as LegacyFooterProps

  if (!leading) {
    return <Group justify="flex-end" gap="sm">{secondary}{primary}</Group>
  }

  if (compact) {
    return (
      <Stack gap="sm">
        <Group justify="flex-start">{leading}</Group>
        <Group justify="flex-end" gap="sm">{secondary}{primary}</Group>
      </Stack>
    )
  }

  return (
    <Box style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
      alignItems: "center",
      gap: "var(--mantine-spacing-sm)",
    }}>
      <Group justify="flex-start">{leading}</Group>
      <Group justify="center">{secondary}</Group>
      <Group justify="flex-end">{primary}</Group>
    </Box>
  )
}

export const Dialog = Object.assign(DialogRoot, {
  Body: DialogBody,
  Divider: DialogDivider,
  Footer: DialogFooter,
})
