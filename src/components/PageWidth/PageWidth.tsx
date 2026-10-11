import { Box, type BoxProps } from "@mantine/core"
import type { ReactNode } from "react"

type PageWidthProps = {
  children: ReactNode
  variant?: "fluid" | "contained"
} & Pick<BoxProps, "className" | "style">

/** Page-level width policy. Feature content must not own its page max-width. */
export function PageWidth({ children, variant = "fluid", ...props }: PageWidthProps) {
  return (
    <Box w="100%" maw={variant === "contained" ? 1280 : undefined} mx={variant === "contained" ? "auto" : undefined} {...props}>
      {children}
    </Box>
  )
}
