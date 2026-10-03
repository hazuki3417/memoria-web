import { Box, Text, Title } from "@mantine/core"

export type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
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
