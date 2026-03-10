"use client"
import { FieldValid } from "@/components"
import { imageConfig } from "@/config"
import { ThumbnailImage } from "@/feature"
import { zod } from "@/lib"
import {
  DEFAULT_FILE_SIZE_PREFIX,
  FileSizePrefix,
  transform,
} from "@/lib/transform"
import { Box, Button, Divider, Flex, TagsInput, Text } from "@mantine/core"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import z from "zod"
import classes from "./ImageItem.module.css"

export const fileSchema = zod.refine(
  z.custom<File>((file) => file instanceof File),
  [
    zod.validate.file.type(imageConfig.type),
    zod.validate.file.size.tooLarge(imageConfig.size.max),
  ],
)

export const tagsSchema = z.array(z.string())

export const imageSchema = z.object({
  taskId: z.string(),
  selected: z.boolean(),
  file: fileSchema,
  tags: tagsSchema,
})

export type ImageValues = z.infer<typeof imageSchema>

export const imageItemSchema = z.object({
  images: z.array(imageSchema).max(imageConfig.count.max),
})

export type ImageItemValues = z.infer<typeof imageItemSchema>

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
        <ThumbnailImage
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
                <ThumbnailImage.SelectableCheckbox {...rest} checked={value} />
              )
            }}
          />
          <Controller
            control={control}
            name={`images.${index}.file`}
            render={({ field }) => {
              return (
                <ThumbnailImage.Image
                  src={URL.createObjectURL(field.value)}
                  alt={field.value.name}
                />
              )
            }}
          />
        </ThumbnailImage>
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
