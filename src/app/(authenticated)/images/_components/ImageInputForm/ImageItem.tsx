"use client"
import { FieldValid } from "@/components"
import { ThumbnailBox } from "@/feature"
import { ze } from "@/lib"
import {
  DEFAULT_FILE_SIZE_PREFIX,
  FileSizePrefix,
  transform,
} from "@/lib/transform"
import { Box, Button, Divider, Flex, TagsInput, Text } from "@mantine/core"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import z from "zod"
import classes from "./ImageItem.module.css"

export type FileSchemaConfig = {
  type: string[]
  size: {
    max: number
  }
}

export const fileSchema = (config: FileSchemaConfig) => {
  return ze.refine(
    z.custom<File>((file) => file instanceof File),
    [
      // ze.verify.file.type(config.type),
      // ze.verify.file.size.tooLarge(config.size.max),
    ],
  )
}

export type TagsSchemaConfig = {
  count: {
    max: number
  }
}

export const tagsSchema = (config: TagsSchemaConfig) => {
  return z.array(z.string()).max(config.count.max)
}

export type ImageSchemaConfig = {
  file: FileSchemaConfig
  tags: TagsSchemaConfig
}
export const imageSchema = (config: ImageSchemaConfig) => {
  return z.object({
    taskId: z.string(),
    selected: z.boolean(),
    file: fileSchema(config.file),
    tags: tagsSchema(config.tags),
  })
}

export type ImageValues = z.infer<ReturnType<typeof imageSchema>>

export type ImageItemSchemaConfig = {
  image: ImageSchemaConfig
  count: {
    max: number
  }
}

export const imageItemSchema = (config: ImageItemSchemaConfig) => {
  return z.object({
    images: z.array(imageSchema(config.image)).max(config.count.max),
  })
}

export type ImageItemValues = z.infer<ReturnType<typeof imageItemSchema>>

export type ImageItemUi = {
  selected?: boolean
  valid?: FieldValid
}

export interface ImageItemProps {
  index: number
  prefix?: FileSizePrefix
  disabled?: boolean
  onRemove?: (index: number, taskId: string) => void
  ui?: ImageItemUi
}

export const ImageItem = (props: ImageItemProps) => {
  const {
    index,
    prefix = DEFAULT_FILE_SIZE_PREFIX,
    disabled = false,
    onRemove,
    ui,
  } = props
  const { selected, valid = "idle" } = ui ?? {}
  const { control } = useFormContext<ImageItemValues>()
  const image = useWatch({
    control,
    name: `images.${index}`,
  })

  const size = transform.file.size({ bytes: image.file.size, prefix })

  return (
    <Box
      className={classes.box}
      data-selected={selected}
      data-valid={valid}
      data-disabled={disabled}
    >
      <Flex gap="xs">
        <ThumbnailBox
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
            name={`images.${index}.file`}
            render={({ field }) => {
              return (
                <ThumbnailBox.Image
                  src={URL.createObjectURL(field.value)}
                  alt={field.value.name}
                />
              )
            }}
          />
        </ThumbnailBox>
        <Divider orientation="vertical" />
        <Box
          style={(theme) => ({
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gridTemplateRows: "auto auto 1fr",
            flex: 1,
            gap: theme.spacing.xs,
            alignContent: "start",
          })}
        >
          <Box>
            <Text size="xs">ファイル名</Text>
          </Box>
          <Box>
            <Text size="xs">{image.file.name}</Text>
          </Box>
          <Box>
            <Text size="xs">ファイルサイズ</Text>
          </Box>
          <Box>
            <Text size="xs">{`${size.value} ${size.unit}`}</Text>
          </Box>
          <Box>
            <Text size="xs">タグ</Text>
          </Box>
          <Box>
            <Controller
              control={control}
              name={`images.${index}.tags`}
              disabled={disabled}
              render={({ field }) => {
                return (
                  <TagsInput
                    size="xs"
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
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Button
            size="xs"
            type="button"
            onClick={() => onRemove?.(index, image.taskId)}
          >
            消去
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}
ImageItem.displayName = "ImageItem"
