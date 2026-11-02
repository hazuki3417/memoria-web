import { Box, Text, Title } from "@mantine/core"
import type { ReactNode } from "react"
import styles from "./PageHeader.module.css"

export type PageHeaderProps = {
  title: string
  description: string
  trailing?: ReactNode
}

export function PageHeader({ title, description, trailing }: PageHeaderProps) {
  // Keep the original DOM structure and spacing for existing consumers.
  if (trailing === undefined) {
    return (
      <Box>
        <Title order={1} size="h2">
          {title}
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          {description}
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <div className={styles.titleRow}>
        <Title order={1} size="h2" className={styles.title}>
          {title}
        </Title>
        <div className={styles.trailing}>{trailing}</div>
      </div>
      <Text c="dimmed" size="sm" mt={4}>
        {description}
      </Text>
    </Box>
  )
}
