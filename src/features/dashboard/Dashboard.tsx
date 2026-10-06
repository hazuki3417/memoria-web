import { Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"

export function Dashboard() {
  return (
    <Stack gap="xl" maw={1280} mx="auto" w="100%">
      <PageHeader
        title="ダッシュボード"
        description="最近のメディアやグループを確認できます。"
      />
    </Stack>
  )
}
