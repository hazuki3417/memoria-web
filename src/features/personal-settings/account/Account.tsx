import { Box, Button, Stack, Text } from "@mantine/core"
import Link from "next/link"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

export function Account() {
  return (
    <Stack gap="xl">
      <PageHeader title="アカウント" description="アカウントを管理します。" />
      <Box>
        <Box c="red">
          <SectionHeader>アカウント削除</SectionHeader>
        </Box>
        <Stack gap="md">
          <Text size="sm">
            アカウントと関連データを削除します。削除前に、対象データとCommunityへの影響を確認できます。
          </Text>
          <Box>
            <Button component={Link} href="/settings/account/delete" color="red" size="sm">
              アカウントを削除する
            </Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}
