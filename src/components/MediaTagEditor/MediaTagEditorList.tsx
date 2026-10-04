import { Box, Divider, Paper } from "@mantine/core"
import type { ReactNode } from "react"

export function MediaTagEditorList({ children }: { children: ReactNode[] }) {
  if (children.length === 0) return null
  return <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
    {children.map((child, index) => <Box key={index}>{index > 0 && <Divider />}{child}</Box>)}
  </Paper>
}
