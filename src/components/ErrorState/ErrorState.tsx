"use client"

import { Box, Button, Center, Group, Stack, Text, ThemeIcon } from "@mantine/core"
import { IconAlertCircle } from "@tabler/icons-react"

type ErrorStateProps = {
  variant: "full" | "inline"
  title: string
  description?: string
  onRetry?: () => void
}

/** 取得失敗の影響範囲に応じて、中央表示と部分表示を使い分ける。 */
export function ErrorState({ variant, title, description, onRetry }: ErrorStateProps) {
  if (variant === "full") {
    return (
      <Center mih={360} role="alert">
        <Stack align="center" maw={420}>
          <ThemeIcon size={48} radius="xl" variant="light" color="red">
            <IconAlertCircle size={24} />
          </ThemeIcon>
          <Text fw={700} size="lg" ta="center">{title}</Text>
          {description && <Text size="sm" c="dimmed" ta="center">{description}</Text>}
          {onRetry && <Button variant="default" onClick={onRetry}>再試行</Button>}
        </Stack>
      </Center>
    )
  }

  return (
    <Box role="alert">
      <Group gap="xs" align="flex-start" wrap="nowrap">
        <ThemeIcon size="sm" color="red" variant="light" radius="xl">
          <IconAlertCircle size={14} />
        </ThemeIcon>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600}>{title}</Text>
          {description && <Text size="xs" c="dimmed">{description}</Text>}
          {onRetry && (
            <Box>
              <Button size="xs" variant="default" onClick={onRetry}>再試行</Button>
            </Box>
          )}
        </Stack>
      </Group>
    </Box>
  )
}
