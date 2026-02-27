import { imageConfig } from "@/config"
import { Select, SelectProps, TagsInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { Control, Controller } from "react-hook-form"
import { z } from "zod"

export const VISIBILITY = {
  ALL: "all",
  PUBLIC: "public",
  PRIVATE: "private",
}

export const imageSearchFormSchema = z.object({
  visibility: z.enum([VISIBILITY.ALL, VISIBILITY.PUBLIC, VISIBILITY.PRIVATE]),
  tags: z.array(z.string()).max(imageConfig.tag.max),
})

export type ImageSearchFormSchema = z.infer<typeof imageSearchFormSchema>

export const imageSearchFormDefaultValue: ImageSearchFormSchema = {
  visibility: VISIBILITY.ALL,
  tags: [],
}

export interface ImageSearchFormProps {
  control: Control<any>
}

export const ImageSearchForm = (props: ImageSearchFormProps) => {
  const { control } = props

  return (
    <Controller
      control={control}
      name="tags"
      render={({ field, fieldState }) => (
        <TagsInput
          style={(theme) => ({
            width: "100%",
          })}
          placeholder="タグ"
          leftSection={<IconSearch size={16} />}
          error={fieldState.error?.message}
          clearable
          {...field}
        />
      )}
    />
  )
}

export interface VisibilitySelectProps extends Omit<SelectProps, "data"> {}

export const VisibilitySelect = (props: VisibilitySelectProps) => {
  const { ...rest } = props
  const options = [
    { label: "すべて", value: VISIBILITY.ALL },
    { label: "公開のみ", value: VISIBILITY.PUBLIC },
    { label: "非公開のみ", value: VISIBILITY.PRIVATE },
  ]

  return <Select data={options} {...rest} />
}
