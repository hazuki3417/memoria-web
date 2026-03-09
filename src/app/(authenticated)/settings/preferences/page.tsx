"use client"
import { Toggle } from "@/components"
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
import { SettingSectionDivider, SettingSectionTitle } from "../_components"

const Page = () => {
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
              <Select
                size="xs"
                mt={8}
                mb={4}
                defaultValue={"iso"}
                data={[
                  { label: "YYYY-MM-DD", value: "iso" },
                  { label: "YYYY/MM/DD", value: "slash-ymd" },
                  { label: "MM/DD/YYYY", value: "slash-mdy" },
                  { label: "DD/MM/YYYY", value: "slash-dmy" },
                  { label: "MMM D, YYYY", value: "long-month" },
                ]}
              />
            </InputWrapper>
            <Radio.Group
              label="ファイルサイズの単位"
              description="Receive email notifications about security campaigns in repositories where you have access to security alerts."
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
              }}
            >
              <Group mt={8} mb={4}>
                <Radio size="xs" color="blue" value="si" label="SI接頭辞" />
                <Radio
                  size="xs"
                  color="blue"
                  value="binary"
                  label="2進接頭辞"
                />
              </Group>
            </Radio.Group>
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
                <Slider
                  w={300}
                  color="blue"
                  size="xs"
                  radius="sm"
                  defaultValue={160}
                  min={80}
                  max={240}
                  step={2}
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
                <Slider
                  w={300}
                  color="blue"
                  size="xs"
                  radius="sm"
                  defaultValue={8}
                  min={0}
                  max={16}
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
            <Toggle
              label="画像切り替えの繰り返し"
              description="プレビューで画像を順番に表示したとき、最後の画像の次に最初の画像へ戻るかどうかを設定します。"
              value="isImageSlideLoopEnabled"
              onChange={(event) => console.debug("debug", event.target.checked)}
            />

            <Divider />

            <Toggle
              label="画像詳細の常時表示"
              description="プレビューによる初期表示時に画像の詳細も合わせて表示するかどうか設定します。"
              value="isImageSlideLoopEnabled"
              onChange={(event) => console.debug("debug", event.target.checked)}
            />
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}

export default Page
