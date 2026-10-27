"use client"

import type { ReactNode } from "react"
import { Alert, Box, Button, Center, Loader, ScrollArea, Stack, Text, ThemeIcon } from "@mantine/core"
import { IconPhoto } from "@tabler/icons-react"
import { MediaGrid } from "./MediaGrid"
import { LoadMoreSentinel } from "./LoadMoreSentinel"

type GroupDetailMediaContentProps = {
 selected: { mediaCount: number } | null
 mediaDetailState: "ready" | "loading" | "error"
 mediaItemsData?: Array<{ id: string; label: string; src: string | null }>
 onRetryGroupMedia?: () => Promise<void>
 onOpenMedia: (index: number) => void
 mediaPageFeedback: ReactNode
 onMediaEndVisible?: () => void
}
export function GroupDetailMediaContent({selected,mediaDetailState,mediaItemsData,onRetryGroupMedia,onOpenMedia:openMediaAt,mediaPageFeedback,onMediaEndVisible}:GroupDetailMediaContentProps) {
 return (
      <ScrollArea flex={1}>
        <Box p="sm">
          {mediaDetailState === "loading" ? (
            <Center mih={360}>
              <Stack align="center">
                <Loader />
                <Text size="sm" c="dimmed">
                  Mediaを読み込んでいます
                </Text>
              </Stack>
            </Center>
          ) : mediaDetailState === "error" ? (
            <Alert color="red" title="GroupのMediaを取得できませんでした">
              <Stack gap="xs" align="flex-start">
                <Text size="sm">
                  最新のGroup情報を確認するため、再取得してください。
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => void onRetryGroupMedia?.()}
                >
                  再試行
                </Button>
              </Stack>
            </Alert>
          ) : (selected?.mediaCount ?? 0) === 0 ? (
            <Center mih={360}>
              <Stack align="center" maw={420}>
                <ThemeIcon size={48} radius="xl" variant="light">
                  <IconPhoto size={24} />
                </ThemeIcon>
                <Text fw={700} size="lg">
                  Mediaがありません
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  このGroupまたはその下位Groupに分類されたMediaはありません。
                </Text>
              </Stack>
            </Center>
          ) : (
            <>
              <MediaGrid onOpen={openMediaAt} items={mediaItemsData} />
              {mediaPageFeedback}
              {onMediaEndVisible && (
                <LoadMoreSentinel onVisible={onMediaEndVisible} />
              )}
            </>
          )}
        </Box>
      </ScrollArea>
 )
}
