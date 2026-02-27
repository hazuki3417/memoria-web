import { imageConfig } from "@/config"
import { Grid, Group, Radio, TagsInput, Text } from "@mantine/core"
import { Control, Controller } from "react-hook-form"
import { z } from "zod"

const styles = {
  col: {
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
}

export const VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
}

export const imageFormSchema = z.object({
  visibility: z.enum([VISIBILITY.PUBLIC, VISIBILITY.PRIVATE]),
  tags: z.array(z.string()).max(imageConfig.tag.max),
})

export type ImageInputFormSchema = z.infer<typeof imageFormSchema>

export const imageFormDefaultValue: ImageInputFormSchema = {
  visibility: VISIBILITY.PRIVATE,
  tags: [],
}

export interface ImageInputFormProps {
  control: Control<any>
  prefix: string
}

export const ImageInputForm = (props: ImageInputFormProps) => {
  const { control, prefix } = props

  return (
    <Grid>
      <Grid.Col span={2} style={styles.col}>
        <Text size="xs">公開範囲</Text>
      </Grid.Col>
      <Grid.Col span={10} style={styles.col}>
        <Controller
          control={control}
          name={[prefix, "visibility"].join(".")}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Group gap="sm">
                <Radio size="xs" value={VISIBILITY.PUBLIC} label="公開" />
                <Radio size="xs" value={VISIBILITY.PRIVATE} label="非公開" />
              </Group>
            </Radio.Group>
          )}
        />
      </Grid.Col>
      <Grid.Col span={2} style={styles.col}>
        <Text size="xs">タグ</Text>
      </Grid.Col>
      <Grid.Col span={10} style={styles.col}>
        <Controller
          control={control}
          name={[prefix, "tags"].join(".")}
          render={({ field, fieldState }) => (
            <TagsInput
              size="xs"
              style={(theme) => ({
                width: "100%",
              })}
              error={fieldState.error?.message}
              clearable
              {...field}
            />
          )}
        />
      </Grid.Col>
    </Grid>
  )
}
