import { Box, Divider, Paper } from "@mantine/core"
import { Children, isValidElement, type ReactNode } from "react"

export function MediaTagEditorList({ children }: { children: ReactNode }) {
  const items = Children.toArray(children)
  if (items.length === 0) return null

  return (
    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
      {items.map((child, index) => (
        <Box key={isValidElement(child) ? child.key : String(child)}>
          {index > 0 && <Divider />}
          {child}
        </Box>
      ))}
    </Paper>
  )
}
