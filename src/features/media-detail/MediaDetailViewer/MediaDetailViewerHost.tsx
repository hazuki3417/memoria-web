"use client"

import { Modal } from "@mantine/core"
import type { ReactNode } from "react"

type MediaDetailViewerHostProps = {
  opened: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Owns the fullscreen overlay contract only.
 * Media-specific layout and async data belong to the children/controllers.
 */
export function MediaDetailViewerHost({
  opened,
  onClose,
  children,
}: MediaDetailViewerHostProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      portalProps={{ target: "#application-modal-root" }}
      padding={0}
      withCloseButton={false}
      styles={{
        content: { background: "transparent" },
        body: { height: "100dvh", padding: 0, background: "transparent" },
      }}
    >
      {children}
    </Modal>
  )
}
