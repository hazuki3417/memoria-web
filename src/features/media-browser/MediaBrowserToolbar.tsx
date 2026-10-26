"use client"

import { Badge, Box, Button, Center, Group, Menu, SegmentedControl, TagsInput } from "@mantine/core"
import { IconCheckbox, IconChevronDown, IconCloudUpload, IconEdit, IconEye, IconFolderPlus, IconPlus, IconSearch, IconShare, IconTrash } from "@tabler/icons-react"

type MediaBrowserToolbarProps = {
  compact: boolean
  selecting: boolean
  selected: Set<string>
  tags: string[]
  setTags: (tags: string[]) => void
  onSubmitTags: () => void
  tagOptions?: string[]
  context: "personal" | "community"
  communityId: string
  hasRemoteItems: boolean
  navigate: (path: string) => void
  onSelectionDialog: (dialog: "group" | "share" | "delete") => void
  onStartSelection: () => void
  onEndSelection: () => void
}

export function MediaBrowserToolbar({
  compact,
  selecting,
  selected,
  tags,
  setTags,
  onSubmitTags,
  tagOptions,
  context,
  communityId,
  hasRemoteItems,
  navigate,
  onSelectionDialog,
  onStartSelection,
  onEndSelection,
}: MediaBrowserToolbarProps) {
  return (
    <Box
                pb="xs"
                style={{
                  display: "grid",
                  gridTemplateColumns: compact
                    ? "minmax(0, 1fr)"
                    : "minmax(0, 1fr) auto",
                  alignItems: "center",
                  gap: "var(--mantine-spacing-xs)",
                }}
              >
                <Box style={{ minWidth: 0 }}>
                  {!selecting ? (
                    <Box
                      component="form"
                      onSubmit={(event) => {
                        event.preventDefault()
                        onSubmitTags()
                      }}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <TagsInput
                          placeholder="Tagを検索"
                          value={tags}
                          onChange={setTags}
                          data={tagOptions}
                          clearable
                          leftSection={<IconSearch size={16} />}
                          size="xs"
                          w={compact ? "100%" : 280}
                          maw="100%"
                          style={{ flex: compact ? "1 1 auto" : undefined }}
                          comboboxProps={{ withinPortal: true }}
                        />
                        <Button size="xs" type="submit" style={{ flexShrink: 0 }}>
                          検索
                        </Button>
                      </Group>
                    </Box>
                  ) : (
                    <Badge size="lg" variant="light">
                      {selected.size}件選択
                    </Badge>
                  )}
                </Box>
    
                <Group
                  gap="xs"
                  justify="flex-end"
                  wrap="nowrap"
                  style={{ gridColumn: compact ? "1" : undefined }}
                >
                  {selecting && (
                    <>
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<IconEdit size={15} />}
                        disabled={selected.size === 0}
                        onClick={() =>
                          navigate(
                            context === "community"
                              ? `/communities/${communityId}/media/edit?mediaIds=${encodeURIComponent([...selected].join(","))}`
                              : `/media/edit?mediaIds=${encodeURIComponent([...selected].join(","))}`,
                          )
                        }
                      >
                        編集
                      </Button>
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<IconFolderPlus size={15} />}
                        disabled={selected.size === 0}
                        onClick={() => onSelectionDialog("group")}
                      >
                        Group
                      </Button>
                      {context === "personal" && (
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconShare size={15} />}
                          disabled={selected.size === 0}
                          onClick={() => onSelectionDialog("share")}
                        >
                          共有
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="default"
                        color="red"
                        leftSection={<IconTrash size={15} />}
                        disabled={selected.size === 0 || hasRemoteItems}
                        onClick={() => onSelectionDialog("delete")}
                      >
                        削除
                      </Button>
                    </>
                  )}
                  {!selecting &&
                    (context === "personal" ? (
                      <Button
                        size="xs"
                        leftSection={<IconCloudUpload size={16} />}
                        onClick={() => navigate("/media/upload")}
                      >
                        アップロード
                      </Button>
                    ) : (
                      <Menu position="bottom-end">
                        <Menu.Target>
                          <Button
                            size="xs"
                            rightSection={<IconChevronDown size={14} />}
                            leftSection={<IconPlus size={16} />}
                          >
                            Mediaを追加
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconCloudUpload size={16} />}
                            onClick={() =>
                              navigate(`/communities/${communityId}/media/upload`)
                            }
                          >
                            Communityへアップロード
                          </Menu.Item>
                          <Menu.Item leftSection={<IconShare size={16} />}>
                            Personal Mediaから共有
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    ))}
                  <SegmentedControl
                    size="xs"
                    value={selecting ? "select" : "view"}
                    onChange={(value) => {
                      if (value === "select") {
                        onStartSelection()
                        return
                      }
                      onEndSelection()
                    }}
                    data={[
                      {
                        value: "view",
                        label: (
                          <Center style={{ gap: 6 }}>
                            <IconEye size={15} />
                            <span>View</span>
                          </Center>
                        ),
                      },
                      {
                        value: "select",
                        label: (
                          <Center style={{ gap: 6 }}>
                            <IconCheckbox size={15} />
                            <span>Select</span>
                          </Center>
                        ),
                      },
                    ]}
                  />
                </Group>
              </Box>
  )
}
