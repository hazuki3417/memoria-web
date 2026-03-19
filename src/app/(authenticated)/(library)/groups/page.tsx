"use client"
import { ActionPanel, ImageLayout } from "@/components"
import { ThumbnailBox } from "@/feature"
import { Box, Flex, Title } from "@mantine/core"
import Link from "next/link"
import { TAB_FIELDS, Tabs } from "../_components"

const Page = () => {
  return (
    <Tabs value={TAB_FIELDS.group}>
      <ActionPanel mb="xs">
        <ActionPanel.Left>
          <Tabs.List />
        </ActionPanel.Left>
        <ActionPanel.Center></ActionPanel.Center>
        <ActionPanel.Right></ActionPanel.Right>
      </ActionPanel>
      <Tabs.Panel value={TAB_FIELDS.group}>
        <ImageLayout>
          <Box>
            <Flex justify="space-between" mb="xs">
              <Title order={4}>グループ1</Title>
              <Link href="">もっと見る</Link>
            </Flex>
            <ImageLayout.Slide>
              {Array.from({ length: 20 }).map((_, i) => (
                <ThumbnailBox key={i} style={{ flex: "0 0 auto" }}>
                  <ThumbnailBox.Image bdrs="sm" src={"sample/thumbnail.webp"} />
                </ThumbnailBox>
              ))}
            </ImageLayout.Slide>
          </Box>
        </ImageLayout>
      </Tabs.Panel>
    </Tabs>
  )
}

export default Page
