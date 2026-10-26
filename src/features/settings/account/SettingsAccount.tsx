import type { ReactNode } from "react"
import { Box, Stack, Text } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

export function SettingsAccount({ deletionAction }: { deletionAction: ReactNode }) {
  return (
    <Stack gap="xl">
      <PageHeader title="アカウント" description="アカウントを管理します。" />
      <Box>
        <Box c="red">
          <SectionHeader>アカウント削除</SectionHeader>
        </Box>
        <Stack gap="md" maw={620}>
          <Text size="sm">
            アカウントと関連データを削除します。削除前に、対象データとCommunityへの影響を確認できます。
          </Text>
          <Box>
            {deletionAction}
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}

