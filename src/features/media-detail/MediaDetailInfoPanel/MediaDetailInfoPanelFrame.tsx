"use client"

import { Box, Stack } from "@mantine/core"
import { AnimatePresence, motion } from "framer-motion"
import type { ReactNode } from "react"

/** Shared visual contract for the existing Media Detail information panel. */
export function MediaDetailInfoPanelFrame({
  compact,
  opened,
  children,
  footer,
}: {
  compact: boolean | undefined
  opened: boolean
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {opened && (
        <motion.div
          initial={compact ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
          animate={compact ? { height: "auto", opacity: 1 } : { width: 340, opacity: 1 }}
          exit={compact ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            overflow: "hidden",
            minWidth: 0,
            gridColumn: compact ? "1" : "2",
            gridRow: compact ? "2" : "1",
          }}
        >
          <Box
            h="100%"
            bg="var(--mantine-color-body)"
            style={{
              borderLeft: compact ? undefined : "1px solid var(--mantine-color-default-border)",
              borderTop: compact ? "1px solid var(--mantine-color-default-border)" : undefined,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Stack gap="md" p="md" style={{ flex: 1, overflowY: "auto" }}>
              {children}
            </Stack>
            {footer}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
