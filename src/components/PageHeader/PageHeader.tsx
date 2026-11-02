import { Box, Text, Title } from "@mantine/core"
import type { ReactNode } from "react"
import styles from "./PageHeader.module.css"

export type PageHeaderProps = {
  title: string
  description: string
  /** Content associated with the title, such as a SaveStatus badge. */
  titleAccessory?: ReactNode
}

export function PageHeader({
  title,
  description,
  titleAccessory,
}: PageHeaderProps) {
  // Preserve the original DOM and spacing for consumers without an accessory,
  // including Usage where the view-mode input lives outside PageHeader.
  if (titleAccessory === undefined) {
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
      <div className={styles.titleGroup}>
        <Title order={1} size="h2" className={styles.title}>
          {title}
        </Title>
        <div className={styles.accessory}>{titleAccessory}</div>
      </div>
      <Text c="dimmed" size="sm" mt={4}>
        {description}
      </Text>
    </Box>
  )
}
