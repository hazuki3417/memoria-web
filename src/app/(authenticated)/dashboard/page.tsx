"use client"
import { ContentLayout } from "@/components"
import { ThumbnailBox } from "@/feature"
import { Box, Flex, Title } from "@mantine/core"
import Link from "next/link"

const Page = () => {
  return (
    <Box>
      <ContentLayout>
        <Box>
          <Flex justify="space-between" mb="xs">
            <Title order={4}>最近追加された画像</Title>
            <Link href="">もっと見る</Link>
          </Flex>
          <ContentLayout.Slide>
            {Array.from({ length: 20 }).map((_, itemIndex) => (
              <ThumbnailBox
                key={itemIndex}
                style={{ flex: "0 0 auto", scrollSnapAlign: "start" }}
              >
                <ThumbnailBox.Image bdrs="sm" src={"sample/thumbnail.webp"} />
              </ThumbnailBox>
            ))}
          </ContentLayout.Slide>
        </Box>
        <Box>
          <Flex justify="space-between" mb="xs">
            <Title order={4}>最近閲覧した画像</Title>
            <Link href="">もっと見る</Link>
          </Flex>
          <ContentLayout.Slide>
            {Array.from({ length: 20 }).map((_, itemIndex) => (
              <ThumbnailBox
                key={itemIndex}
                style={{ flex: "0 0 auto", scrollSnapAlign: "start" }}
              >
                <ThumbnailBox.Image bdrs="sm" src={"sample/thumbnail.webp"} />
              </ThumbnailBox>
            ))}
          </ContentLayout.Slide>
        </Box>
      </ContentLayout>
    </Box>
  )
}

export default Page
