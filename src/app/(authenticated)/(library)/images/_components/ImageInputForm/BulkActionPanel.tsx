"use client"
import { ButtonGroup, TagsInput } from "@/components"
import { useUserContext } from "@/providers"
import { Box, Button, Checkbox, Divider, Flex, Stack } from "@mantine/core"
import React, { useMemo } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { ImageInputFormValues } from "./ImageInputFormSchema"
import { useImageTagBulkAction } from "./useImageTagBulkAction"

export interface BulkActionPanelProps {
  onAddTags?: (tags: string[]) => void
  onRemoveTags?: (tags: string[]) => void
  onReplaceTags?: (tags: string[]) => void
  onRemoveFiles?: () => void
}

export const BulkActionPanel = (props: BulkActionPanelProps) => {
  const { onAddTags, onRemoveTags, onReplaceTags, onRemoveFiles, ...rest } =
    props
  const user = useUserContext()

  const { control, setValue } = useFormContext<ImageInputFormValues>()

  const tags = useWatch({
    control: control,
    name: "bulk.tags",
  })

  const images = useWatch({
    control: control,
    name: "images",
  })

  const count = useMemo(() => {
    return {
      selected: images.filter((image) => image.selected).length,
      total: images.length,
    }
  }, [images])

  const bulkCheckboxState = useMemo(() => {
    const all = images.every((image) => image.selected)
    const some = images.some((image) => image.selected)
    return {
      checked: all,
      indeterminate: some && !all,
    }
  }, [images])

  const handleBulkCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // NOTE: indeterminateのときは常にチェックを外す動作にする
    const checked = bulkCheckboxState.indeterminate
      ? false
      : event.target.checked
    images.forEach((_, index) => {
      setValue(`images.${index}.selected`, checked, { shouldDirty: true })
    })
  }

  const action = useImageTagBulkAction()

  const handleAdd = () => {
    action.add(tags)
    onAddTags?.(tags)
  }

  const handleRemove = () => {
    action.remove(tags)
    onRemoveTags?.(tags)
  }

  const handleReplace = () => {
    action.replace(tags)
    onReplaceTags?.(tags)
  }

  return (
    <Box>
      <Divider />
      <Flex align="center" w="100%">
        <Box w="160px" m="xs" pl="8px">
          <Checkbox
            size="xs"
            variant="filled"
            color="blue"
            label={`選択：${count.selected} / ${count.total}`}
            checked={bulkCheckboxState.checked}
            indeterminate={bulkCheckboxState.indeterminate}
            onChange={handleBulkCheckboxChange}
            styles={{
              label: {
                paddingLeft: "calc(.625rem * 0.5)",
              },
            }}
          />
        </Box>
        <Divider orientation="vertical" />
        <Box flex="1" m="xs">
          <Stack gap="calc(.625rem * 0.5)">
            <Controller
              control={control}
              name={`bulk.tags`}
              render={({ field }) => {
                return (
                  <TagsInput
                    size="xs"
                    label="タグ"
                    current={tags.length}
                    limit={user.limit.upload.tag.count}
                    clearable
                    {...field}
                  />
                )
              }}
            />
            <Flex justify="space-between" gap="xs">
              <Controller
                control={control}
                name={`bulk.reflection`}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return (
                    <Checkbox
                      size="xs"
                      color="blue"
                      styles={{
                        label: {
                          paddingLeft: "calc(.625rem * 0.5)",
                        },
                      }}
                      label="アップロード時に設定したタグを反映する"
                      {...rest}
                      checked={value}
                    />
                  )
                }}
              />
              <ButtonGroup>
                <Button size="xs" type="button" onClick={handleAdd}>
                  追加
                </Button>
                <Button size="xs" type="button" onClick={handleRemove}>
                  除去
                </Button>
                <Button size="xs" type="button" onClick={handleReplace}>
                  置換
                </Button>
              </ButtonGroup>
            </Flex>
          </Stack>
        </Box>
        <Divider orientation="vertical" />
        <Box m="xs" style={{ display: "flex", alignItems: "center" }}>
          <Button size="xs" type="button" onClick={onRemoveFiles}>
            消去
          </Button>
        </Box>
      </Flex>
      <Divider />
    </Box>
  )
}
