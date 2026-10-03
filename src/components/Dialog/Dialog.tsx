"use client"

import { Box, Group, Modal, Stack } from "@mantine/core"
import type { ModalProps } from "@mantine/core"
import type { ReactNode } from "react"

type DialogProps = Omit<ModalProps, "children"> & {
  children: ReactNode
  footer?: ReactNode
}

function DialogRoot({ children, footer, ...props }: DialogProps) {
  return (
    <Modal {...props} centered withCloseButton={false}>
      <Stack gap="lg">
        {children}
        {footer}
      </Stack>
    </Modal>
  )
}

function DialogFooter({
  leading,
  secondary,
  primary,
}: {
  leading?: ReactNode
  secondary?: ReactNode
  primary?: ReactNode
}) {
  if (!leading) {
    return (
      <Group justify="flex-end" gap="sm">
        {secondary}
        {primary}
      </Group>
    )
  }

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
        alignItems: "center",
        gap: "var(--mantine-spacing-sm)",
      }}
    >
      <Group justify="flex-start">{leading}</Group>
      <Group justify="center">{secondary}</Group>
      <Group justify="flex-end">{primary}</Group>
    </Box>
  )
}

export const Dialog = Object.assign(DialogRoot, {
  Footer: DialogFooter,
})
