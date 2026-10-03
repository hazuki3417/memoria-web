import { Box, Divider, Title } from "@mantine/core"
import type { ReactNode } from "react"

export type SectionHeaderProps = {
  children: ReactNode
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <Box>
      <Title order={2} size="h4">
        {children}
      </Title>
      <Divider mt="sm" mb="lg" />
    </Box>
  )
}
