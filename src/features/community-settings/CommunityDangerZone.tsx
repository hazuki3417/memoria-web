import { Box, Button, Stack, Text } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
export function CommunityDangerZone({ communityId }: { communityId: string }) {
  return (
    <>
        <Box>
          <Box c="red">
            <SectionHeader>Community削除</SectionHeader>
          </Box>
          <Stack gap="md" maw={620}>
            <Text size="sm">
              Communityの削除は元に戻せません。Community管理Mediaも削除対象になります。
            </Text>
            <Box>
              <Button
                color="red"
                variant="default"
                size="sm"
                component="a"
                href={`/communities/${encodeURIComponent(communityId)}/settings/delete`}
              >
                Communityを削除する
              </Button>
            </Box>
          </Stack>
        </Box>
      )}

    </>
  )
}
