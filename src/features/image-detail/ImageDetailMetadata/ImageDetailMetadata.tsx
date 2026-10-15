"use client"

import { Button, Group, Stack, Text } from "@mantine/core"
import { IconDownload, IconInfoCircle } from "@tabler/icons-react"

export function ImageDetailMetadata({ downloadMock }: { downloadMock: "available" | "forbidden" | "processing" }) {
  return <>
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                ファイルサイズ
                              </Text>
                              <Text size="xs">8.4 MB</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                サイズ
                              </Text>
                              <Text size="xs">4032 × 3024</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                アップロード
                              </Text>
                              <Text size="xs">2026/10/03 08:42</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                Uploader
                              </Text>
                              <Text size="xs">Hazuki</Text>
                            </Group>
                          </Stack>
                          <Stack gap={4}>
                            <Button
                              size="xs"
                              variant="default"
                              fullWidth
                              disabled={downloadMock !== "available"}
                              leftSection={<IconDownload size={15} />}
                              aria-describedby={
                                downloadMock === "available"
                                  ? undefined
                                  : "original-download-unavailable"
                              }
                            >
                              Originalをダウンロード
                            </Button>
                            {downloadMock !== "available" && (
                              <Group
                                gap={5}
                                align="flex-start"
                                wrap="nowrap"
                                id="original-download-unavailable"
                              >
                                <IconInfoCircle
                                  size={14}
                                  style={{ flexShrink: 0, marginTop: 2 }}
                                />
                                <Text size="xs" c="dimmed">
                                  {downloadMock === "forbidden"
                                    ? "このMediaのOriginalをダウンロードする権限がありません。"
                                    : "Originalを準備中です。処理完了後にダウンロードできます。"}
                                </Text>
                              </Group>
                            )}
                          </Stack>
  </>
}
