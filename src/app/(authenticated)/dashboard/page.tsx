"use client"
import { ImageLayout } from "@/components"
import { ThumbnailBox } from "@/feature"
import { Box, Flex, Title } from "@mantine/core"
import Link from "next/link"

const Page = () => {
  return (
    <Box>
      <ImageLayout>
        <Box>
          <Flex justify="space-between" mb="xs">
            <Title order={4}>最近追加された画像</Title>
            <Link href="">もっと見る</Link>
          </Flex>
          <ImageLayout.Slide>
            {Array.from({ length: 20 }).map((_, itemIndex) => (
              <ThumbnailBox
                key={itemIndex}
                style={{ flex: "0 0 auto", scrollSnapAlign: "start" }}
              >
                <ThumbnailBox.Image bdrs="sm" src={"sample/thumbnail.webp"} />
              </ThumbnailBox>
            ))}
          </ImageLayout.Slide>
        </Box>
        <Box>
          <Flex justify="space-between" mb="xs">
            <Title order={4}>最近閲覧した画像</Title>
            <Link href="">もっと見る</Link>
          </Flex>
          <ImageLayout.Slide>
            {Array.from({ length: 20 }).map((_, itemIndex) => (
              <ThumbnailBox
                key={itemIndex}
                style={{ flex: "0 0 auto", scrollSnapAlign: "start" }}
              >
                <ThumbnailBox.Image bdrs="sm" src={"sample/thumbnail.webp"} />
              </ThumbnailBox>
            ))}
          </ImageLayout.Slide>
        </Box>
      </ImageLayout>
    </Box>
  )
}

export default Page
