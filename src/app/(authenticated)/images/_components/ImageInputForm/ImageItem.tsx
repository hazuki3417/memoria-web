"use client"
import { imageConfig } from "@/config"
import { ThumbnailImage } from "@/feature"
import { zod } from "@/lib"
import { Box, Button, Divider, Flex, TagsInput, Text } from "@mantine/core"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import z from "zod"

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
  selectable: z.boolean(),
  file: fileSchema,
  tags: tagsSchema,
})

export type ImageValues = z.infer<typeof imageSchema>

export const imageItemSchema = z.object({
  images: z.array(imageSchema).max(imageConfig.count.max),
})

export type ImageItemValues = z.infer<typeof imageItemSchema>

export interface ImageItemProps {
  index: number
  disabled?: boolean
  onRemove?: (index: number, taskId: string) => void
}

export const ImageItem = (props: ImageItemProps) => {
  const { index, disabled = false, onRemove } = props
  const { control } = useFormContext<ImageItemValues>()
  const image = useWatch({
    control,
    name: `images.${index}`,
  })

  return (
    <Box p="xs">
      <Flex gap="xs">
        <ThumbnailImage
          ui={{
            outline: true,
          }}
        >
          <Controller
            control={control}
            name={`images.${index}.selectable`}
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
            <Text size="xs">{image.file.size}</Text>
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
            取消
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}
ImageItem.displayName = "ImageItem"
