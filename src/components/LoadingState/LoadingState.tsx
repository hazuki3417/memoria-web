"use client"

import { Center, Group, Loader, Stack, Text } from "@mantine/core"

type LoadingStateProps = {
  message: string
  variant?: "full" | "inline"
  layout?: "row" | "column"
  padding?: "md" | "lg"
  gap?: "xs" | number
  status?: boolean
}

export function LoadingState({
  message,
  variant = "full",
  layout = "column",
  padding = "md",
  gap,
  status = false,
}: LoadingStateProps) {
  const content = layout === "row" ? (
    <Group gap={gap ?? "xs"}>
      <Loader size="sm" />
      <Text size="sm" c="dimmed">{message}</Text>
    </Group>
  ) : (
    <Stack align="center" gap={gap}>
      <Loader size={variant === "full" ? undefined : "sm"} />
      <Text size={variant === "full" ? "sm" : "xs"} c="dimmed">
        {message}
      </Text>
    </Stack>
  )

  return (
    <Center
      {...(variant === "full" ? { mih: 360 } : { py: padding })}
      role={status ? "status" : undefined}
    >
      {content}
    </Center>
  )
}
