"use client"
import { Toggle } from "@/components"
import { useGetPreferenceQuery } from "@/graphql"
import { useFeedbackContext } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Box,
  Divider,
  Group,
  InputWrapper,
  Paper,
  Radio,
  Select,
  Slider,
  Stack,
  Title,
} from "@mantine/core"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { SettingSectionDivider, SettingSectionTitle } from "../_components"

const preferenceInputFormSchema = z.object({
  file: z.object({
    dateFormat: z.string(),
    fileSizeUnit: z.string(),
  }),
  thumbnail: z.object({
    size: z.number(),
    spacing: z.number(),
  }),
  preview: z.object({
    loop: z.boolean(),
    show: z.boolean(),
  }),
})

type PreferenceInputFormValues = z.infer<typeof preferenceInputFormSchema>

const preferenceInputFormDefaultValue: PreferenceInputFormValues = {
  file: {
    dateFormat: "",
    fileSizeUnit: "",
  },
  thumbnail: {
    size: 160,
    spacing: 8,
  },
  preview: {
    loop: false,
    show: false,
  },
}

const Page = () => {
  const getPreference = useGetPreferenceQuery()

  const methods = useForm<PreferenceInputFormValues>({
    resolver: zodResolver(preferenceInputFormSchema),
    defaultValues: {
      ...preferenceInputFormDefaultValue,
    },
  })

  const { control, handleSubmit, reset } = methods

  const feedback = useFeedbackContext()

  useEffect(() => {
    if (getPreference.data) {
      const formData = getPreference.data.me.preference
      console.debug("formData", formData)
      reset({
        ...formData,
      })
    }
  }, [getPreference.data, reset])

  return (
    <>
      <SettingSectionTitle>Preferences</SettingSectionTitle>
      <SettingSectionDivider />

      <Stack gap="md">
        <Paper shadow="xs" withBorder>
          <Title p="xs" order={6}>
            ファイル
          </Title>
          <Divider />
          <Stack p="xs" gap="xs">
            <InputWrapper
              label="日付フォーマット"
              description="Receive email notifications about security campaigns in repositories where you have access to security alerts."
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
              }}
            >
              <Controller
                control={control}
                name="file.dateFormat"
                render={({ field }) => {
                  return (
                    <Select
                      size="xs"
                      mt={8}
                      mb={4}
                      data={[
                        // FIX: value側の形式を検討する
                        { label: "YYYY-MM-DD", value: "YYYY_MM_DD" },
                        { label: "YYYY/MM/DD", value: "1" },
                        { label: "MM/DD/YYYY", value: "2" },
                        { label: "DD/MM/YYYY", value: "3" },
                        { label: "MMM D, YYYY", value: "4" },
                      ]}
                      {...field}
                    />
                  )
                }}
              />
            </InputWrapper>
            <Controller
              control={control}
              name="file.fileSizeUnit"
              render={({ field }) => {
                return (
                  <Radio.Group
                    label="ファイルサイズの単位"
                    description="Receive email notifications about security campaigns in repositories where you have access to security alerts."
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                    }}
                    {...field}
                  >
                    <Group mt={8} mb={4}>
                      <Radio
                        size="xs"
                        color="blue"
                        value="SI"
                        label="SI接頭辞"
                      />
                      <Radio
                        size="xs"
                        color="blue"
                        value="BINARY"
                        label="2進接頭辞"
                      />
                    </Group>
                  </Radio.Group>
                )
              }}
            />
          </Stack>
        </Paper>

        <Paper shadow="xs" withBorder>
          <Title p="xs" order={6}>
            サムネイル
          </Title>
          <Divider />
          <Stack p="xs" gap="xs">
            <InputWrapper
              label="サムネイルの大きさ"
              description="画像一覧に表示されるサムネイルの大きさを調整します。"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
              }}
            >
              <Box mt={8} mb={4}>
                <Controller
                  control={control}
                  name="thumbnail.size"
                  render={({ field }) => (
                    <Slider
                      w={300}
                      color="blue"
                      size="xs"
                      radius="sm"
                      {...field}
                      value={Number(field.value)}
                      min={80}
                      max={240}
                      step={2}
                    />
                  )}
                />
              </Box>
            </InputWrapper>

            <Divider />

            <InputWrapper
              label="サムネイル間のスペース"
              description="画像一覧で表示されるサムネイル同士の間隔を調整します。"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
              }}
            >
              <Box mt={8} mb={4}>
                <Controller
                  control={control}
                  name="thumbnail.spacing"
                  render={({ field }) => (
                    <Slider
                      w={300}
                      color="blue"
                      size="xs"
                      radius="sm"
                      {...field}
                      value={Number(field.value)}
                      min={0}
                      max={16}
                    />
                  )}
                />
              </Box>
            </InputWrapper>
          </Stack>
        </Paper>

        <Paper shadow="xs" withBorder>
          <Title p="xs" order={6}>
            プレビュー
          </Title>
          <Divider />
          <Stack p="xs" gap="xs">
            <Controller
              control={control}
              name="preview.loop"
              render={({ field }) => {
                const { value, ...rest } = field
                return (
                  <Toggle
                    label="画像切り替えの繰り返し"
                    description="プレビューで画像を順番に表示したとき、最後の画像の次に最初の画像へ戻るかどうかを設定します。"
                    checked={value}
                    {...rest}
                  />
                )
              }}
            />

            <Divider />
            <Controller
              control={control}
              name="preview.show"
              render={({ field }) => {
                const { value, ...rest } = field
                return (
                  <Toggle
                    label="画像詳細の常時表示"
                    description="プレビューによる初期表示時に画像の詳細も合わせて表示するかどうか設定します。"
                    checked={value}
                    {...rest}
                  />
                )
              }}
            />
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}

export default Page
