"use client"
import { FieldValid, FormModeSwitch, TagsInput } from "@/components"
import { ThumbnailBox } from "@/feature"
import {
  DEFAULT_FILE_SIZE_PREFIX,
  FileSizePrefix,
  transform,
} from "@/lib/transform"
import { Box, Button, Divider, Flex, Text } from "@mantine/core"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import classes from "./ImageItem.module.css"
import { ImageItemValues } from "./ImageItemSchema"

export type ImageItemConfig = {
  prefix?: FileSizePrefix
  limit?: number
}

export type ImageItemUi = {
  selected?: boolean
  valid?: FieldValid
}

export interface ImageItemProps {
  index: number
  disabled?: boolean
  onRemove?: (index: number, taskId: string) => void
  config?: ImageItemConfig
  ui?: ImageItemUi
}

export const ImageItem = (props: ImageItemProps) => {
  const { index, disabled = false, onRemove, ui, config } = props
  const { selected, valid = "idle" } = ui ?? {}
  const { prefix = DEFAULT_FILE_SIZE_PREFIX, limit = 30 } = config ?? {}
  const { control } = useFormContext<ImageItemValues>()
  const image = useWatch({
    control,
    name: `images.${index}`,
  })

  const size = transform.file.size({ bytes: image.preview.size, prefix })

  return (
    <Box
      className={classes.box}
      data-selected={selected}
      data-valid={valid}
      data-disabled={disabled}
    >
      <Flex>
        <ThumbnailBox
          m="xs"
          ui={{
            outline: true,
          }}
        >
          <Controller
            control={control}
            name={`images.${index}.selected`}
            disabled={disabled}
            render={({ field }) => {
              const { value, ...rest } = field
              return (
                <ThumbnailBox.SelectableCheckbox {...rest} checked={value} />
              )
            }}
          />
          <Controller
            control={control}
            name={`images.${index}.preview`}
            render={({ field }) => {
              return (
                <ThumbnailBox.Image
                  src={field.value.src}
                  alt={field.value.name}
                />
              )
            }}
          />
        </ThumbnailBox>
        <Divider orientation="vertical" />
        <Box
          m="xs"
          style={(theme) => ({
            display: "grid",
            gridTemplateColumns: "0.1fr 1fr",
            gridTemplateRows: "auto auto 1fr",
            flex: 1,
            gap: theme.spacing.xs,
            // justifyContent: "center",
            alignContent: "start",
            // alignItems: "center"
          })}
        >
          <Box>
            <Text size="xs">ファイル名</Text>
          </Box>
          <Box>
            <Text size="xs">{image.preview.name}</Text>
          </Box>
          <Box>
            <Text size="xs">ファイルサイズ</Text>
          </Box>
          <Box>
            <Text size="xs">{`${size.value} ${size.unit}`}</Text>
          </Box>
          <Box style={{ gridColumn: "span 2" }}>
            <Controller
              control={control}
              name={`images.${index}.tags`}
              disabled={disabled}
              render={({ field }) => {
                return (
                  <TagsInput
                    size="xs"
                    label="タグ"
                    current={image.tags.length}
                    limit={limit}
                    styles={{
                      root: { height: "100%" },
                      wrapper: { height: "100%" },
                      input: { height: "100%" },
                    }}
                    {...field}
                    clearable
                  />
                )
              }}
            />
          </Box>
        </Box>
        <Divider orientation="vertical" />
        <Box w="54px" m="xs" style={{ display: "flex", alignItems: "center" }}>
          <FormModeSwitch.New>
            <Button
              size="xs"
              type="button"
              onClick={() => onRemove?.(index, image.taskId)}
            >
              消去
            </Button>
          </FormModeSwitch.New>
        </Box>
      </Flex>
    </Box>
  )
}
ImageItem.displayName = "ImageItem"
