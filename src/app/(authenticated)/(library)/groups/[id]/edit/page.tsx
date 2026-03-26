"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  ResizeSplitView,
} from "@/components"
import { ThumbnailBox } from "@/feature"
import { useGetImageGroupQuery } from "@/graphql"
import { useIntersection, useUriParams } from "@/hooks"
import { createFormDefaults } from "@/lib/form"
import { ImageDetailPayload } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Flex, TextInput } from "@mantine/core"
import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react"
import { t } from "i18next"
import { useMemo } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import z from "zod"

type PathParam = {
  id: string
}

const inputFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  add: z.array(z.string()),
  remove: z.array(z.string()),
})

type InputFormValues = z.infer<typeof inputFormSchema>

const inputFormDefaultValues = createFormDefaults<InputFormValues>({
  id: "",
  name: "",
  add: [],
  remove: [],
})

const Page = () => {
  const uriParams = useUriParams<PathParam>()

  const methods = useForm<InputFormValues>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      ...inputFormDefaultValues({
        id: uriParams.id,
      }),
    },
  })
  const { handleSubmit, control } = methods

  const searchValid = async (values: InputFormValues) => {
    console.log("submit values:", values)
  }

  const searchInvalid = async (errors: FieldErrors<InputFormValues>) => {
    console.log("submit error:", errors)
  }

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

  return (
    <form
      onSubmit={handleSubmit(searchValid, searchInvalid)}
      style={{ height: "100%" }}
    >
      <Box
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Flex justify="space-between" align="center" mb="xs">
          <Controller
            control={methods.control}
            name={`name`}
            render={({ field }) => (
              <TextInput size="xs" placeholder="グループ名" {...field} />
            )}
          />
          <Flex align="center" gap="xs">
            {/* <Text size="xs">{`${imageGroup?.count ?? 0} 件`}</Text> */}
            <ButtonGroup>
              <Button
                size="xs"
                leftSection={<IconTrash size={16} />}
                type="button"
                onClick={() => handleDeleteImageGroup("")}
              >
                {t("button.delete")}
              </Button>
            </ButtonGroup>
          </Flex>
        </Flex>
        <ResizeSplitView
          defaultLayout={{ left: 50, right: 50 }}
          style={{
            flex: 1,
            marginBottom: "var(--mantine-spacing-xs)",
          }}
        >
          <ResizeSplitView.Left>
            <Box
              style={(theme) => ({
                height: "100%",
                display: "flex",
                flexDirection: "column",
              })}
            >
              <ContentLayout>
                <ContentLayout.Grid>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                  <ThumbnailBox>
                    <ThumbnailBox.Image
                      bdrs="sm"
                      src={"/sample/thumbnail0.webp"}
                    />
                  </ThumbnailBox>
                </ContentLayout.Grid>
              </ContentLayout>
            </Box>
          </ResizeSplitView.Left>
          <ResizeSplitView.Separator />
          <ResizeSplitView.Right>
            <Box
              style={(theme) => ({
                height: "100%",
                display: "flex",
                flexDirection: "column",
              })}
            >
              <ContentLayout.Grid>
                {images.map((image) => {
                  return (
                    <ThumbnailBox key={image.id}>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src={image.image.thumbnail}
                      />
                    </ThumbnailBox>
                  )
                })}
              </ContentLayout.Grid>
            </Box>
          </ResizeSplitView.Right>
        </ResizeSplitView>
        <ActionPanel>
          <ActionPanel.Left></ActionPanel.Left>
          <ActionPanel.Center></ActionPanel.Center>
          <ActionPanel.Right>
            <ButtonGroup>
              <Button
                size="xs"
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
              >
                {t("button.update")}
              </Button>
            </ButtonGroup>
          </ActionPanel.Right>
        </ActionPanel>
      </Box>
    </form>
  )
}
export default Page
