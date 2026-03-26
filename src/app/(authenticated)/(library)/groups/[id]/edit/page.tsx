"use client"
import { ActionPanel, ButtonGroup } from "@/components"
import { useGetImageGroupQuery } from "@/graphql"
import { useIntersection, useUriParams } from "@/hooks"
import { ImageDetailPayload } from "@/providers"
import { Box, Button, Flex, Text, Title } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { t } from "i18next"
import { useMemo } from "react"

type PathParam = {
  id: string
}

const Page = () => {
  const uriParams = useUriParams<PathParam>()

  const filter = { id: uriParams.id }

  const { data, fetchMore } = useGetImageGroupQuery({
    variables: {
      first: 50,
      filter,
    },
  })

  const intersection = useIntersection({
    intersect: async () => {
      const pageInfo = data?.imageGroup.images.pageInfo
      if (!pageInfo?.hasNextPage) return
      fetchMore({
        variables: {
          first: 30,
          after: pageInfo.endCursor,
          filter,
        },
      })
    },
  })

  const imageGroup = data?.imageGroup

  const images = useMemo(() => {
    if (!data) {
      return []
    }
    const edges = data.imageGroup.images.edges
    return edges.map((imageEdge) => {
      const image = imageEdge.node
      return {
        id: image.id,
        info: {
          file: {
            name: image.file.name,
            size: image.file.size,
            date: "",
          },
          image: {
            width: image.size.width,
            height: image.size.height,
          },
          tags: [],
        },
        image: {
          preview: image.src.preview,
          thumbnail: image.src.thumbnail,
          alt: image.file.name,
        },
      } satisfies ImageDetailPayload
    })
  }, [data])

  const handleDeleteImageGroup = (id: string) => {}
  const handleUpdateImageGroup = (id: string) => {}

  return (
    <Box>
      <Flex p="xs" justify="space-between" align="center">
        <Title order={4}>{imageGroup?.name ?? ""}</Title>
        <Text size="xs">{`${imageGroup?.count ?? 0} 件`}</Text>
      </Flex>
      <ActionPanel>
        <ActionPanel.Left></ActionPanel.Left>
        <ActionPanel.Center></ActionPanel.Center>
        <ActionPanel.Right>
          <ButtonGroup>
            <Button
              size="xs"
              leftSection={<IconTrash size={16} />}
              onClick={() => handleDeleteImageGroup("")}
            >
              {t("button.delete")}
            </Button>
            <Button
              size="xs"
              leftSection={<IconTrash size={16} />}
              onClick={() => handleUpdateImageGroup("imageGroup.id")}
            >
              {t("button.delete")}
            </Button>
          </ButtonGroup>
        </ActionPanel.Right>
      </ActionPanel>
    </Box>
  )
}
export default Page
