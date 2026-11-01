"use client"

import { Box, Modal as MantineModal } from "@mantine/core"
import type { ModalProps as MantineModalProps } from "@mantine/core"
import type { ReactNode } from "react"
import styles from "../Modal.module.css"
type ModalProps = Omit<MantineModalProps, "children"> & { children: ReactNode }

export function ModalRoot({ children, ...props }: ModalProps) {
  return (
    <MantineModal {...props} centered withCloseButton={false}>
      <Box tabIndex={-1} data-autofocus style={{ position: "absolute" }} />
      <div className={styles.layout}>{children}</div>
    </MantineModal>
  )
}
