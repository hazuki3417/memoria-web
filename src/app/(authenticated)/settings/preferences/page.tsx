"use client"
import { Toggle } from "@/components"
import { Divider, Paper, Stack, Title } from "@mantine/core"
import { SettingSectionDivider, SettingSectionTitle } from "../_components"

const Page = () => {
  return (
    <>
      <SettingSectionTitle>Preferences</SettingSectionTitle>
      <SettingSectionDivider />
      <Stack gap="md">
        <Toggle
          label="日付フォーマット"
          description="Receive email notifications about security campaigns in repositories where you have access to security alerts."
          error="error"
          value={"svelte"}
          onChange={(event) => console.debug("debug", event.target.checked)}
        />
        <Toggle
          label="ファイルサイズの単位"
          description="Receive email notifications about security campaigns in repositories where you have access to security alerts."
          error="error"
          value={"svelte"}
          onChange={(event) => console.debug("debug", event.target.checked)}
        />

        <Paper shadow="xs" withBorder>
          <Title p="xs" order={6}>
            サムネイル
          </Title>
          <Divider />
          <Stack p="xs" gap="xs">
            <Toggle
              label="サムネイルの大きさ"
              description="画像一覧に表示されるサムネイルの大きさを調整します。"
              value="thumbnailSize"
              onChange={(event) => console.debug("debug", event.target.checked)}
            />

            <Divider />

            <Toggle
              label="サムネイル間のスペース"
              description="画像一覧で表示されるサムネイル同士の間隔を調整します。"
              value="thumbnailGap"
              onChange={(event) => console.debug("debug", event.target.checked)}
            />
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
