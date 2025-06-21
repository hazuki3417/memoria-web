import { imageConfig } from "@/config";
import { Grid, Group, Radio, TagsInput, Text } from "@mantine/core";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

const styles = {
  col: {
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
};

export const VISIBILITY = {
  ALL: "all",
  PUBLIC: "public",
  PRIVATE: "private",
};

export const imageSearchFormSchema = z.object({
  visibility: z.enum([VISIBILITY.ALL, VISIBILITY.PUBLIC, VISIBILITY.PRIVATE]),
  tags: z.array(z.string()).max(imageConfig.tag.max),
});

export type ImageSearchFormSchema = z.infer<typeof imageSearchFormSchema>;

export const imageSearchFormDefaultValue: ImageSearchFormSchema = {
  visibility: VISIBILITY.ALL,
  tags: [],
};

export interface ImageSearchFormProps {
  control: Control<any>;
}

export const ImageSearchForm = (props: ImageSearchFormProps) => {
  const { control } = props;

  return (
    <Grid>
      <Grid.Col span={2} style={styles.col}>
        <Text>公開範囲</Text>
      </Grid.Col>
      <Grid.Col span={10} style={styles.col}>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <Radio.Group {...field}>
              <Group gap="sm">
                <Radio value={VISIBILITY.ALL} label="すべて" />
                <Radio value={VISIBILITY.PUBLIC} label="公開のみ" />
                <Radio value={VISIBILITY.PRIVATE} label="非公開のみ" />
              </Group>
            </Radio.Group>
          )}
        />
      </Grid.Col>
      <Grid.Col span={2} style={styles.col}>
        <Text>タグ</Text>
      </Grid.Col>
      <Grid.Col span={10} style={styles.col}>
        <Controller
          control={control}
          name="tags"
          render={({ field, fieldState }) => (
            <TagsInput
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
  );
};
