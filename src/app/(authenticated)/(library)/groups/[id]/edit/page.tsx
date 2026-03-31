"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  ResizeSplitView,
} from "@/components"
import { ThumbnailBox } from "@/feature"
import {
  useGetImageGroupQuery,
  useGetImagesQuery,
  useUpdateImageGroupMutation,
} from "@/graphql"
import { useIntersection, useUriParams } from "@/hooks"
import { createFormDefaults } from "@/lib/form"
import { ImageDetailPayload } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Flex, TagsInput, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { t } from "i18next"
import { useEffect, useMemo, useState } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import z from "zod"
import { useImageGroupMembership } from "../../_components"

type PathParam = {
  id: string
}

const searchFormSchema = z.object({
  tags: z.array(z.string()),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const searchFormDefaultValues = createFormDefaults<SearchFormValues>({
  tags: [],
})

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

  const membership = useImageGroupMembership<ImageDetailPayload>({ items: [] })

  const searchFormMethod = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      ...searchFormDefaultValues(),
    },
  })

  const inputFormMethod = useForm<InputFormValues>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      ...inputFormDefaultValues({
        id: uriParams.id,
      }),
    },
  })

  const [searchFormFilter, setSearchFormFilter] = useState<SearchFormValues>({
    ...searchFormDefaultValues(),
  })
  const inputFormFilter = { id: uriParams.id }

  const { data: imagesData, fetchMore: fetchMoreImages } = useGetImagesQuery({
    variables: {
      first: 100,
      filter: searchFormFilter,
    },
    notifyOnNetworkStatusChange: true,
  })

  const { data: imageGroupData, fetchMore: fetchMoreImageGroup } =
    useGetImageGroupQuery({
      variables: {
        first: 50,
        filter: inputFormFilter,
      },
    })

  const searchFormIntersection = useIntersection({
    intersect: async () => {
      const pageInfo = imagesData?.images.pageInfo
      if (!pageInfo?.hasNextPage) return
      fetchMoreImages({
        variables: {
          first: 50,
          after: pageInfo.endCursor,
          filter: searchFormFilter,
        },
      })
    },
  })

  const inputFormIntersection = useIntersection({
    intersect: async () => {
      const pageInfo = imageGroupData?.imageGroup.images.pageInfo
      if (!pageInfo?.hasNextPage) return
      fetchMoreImageGroup({
        variables: {
          first: 30,
          after: pageInfo.endCursor,
          filter: inputFormFilter,
        },
      })
    },
  })

  const [updateImageGroup, {}] = useUpdateImageGroupMutation()

  const searchValid = async (values: SearchFormValues) => {
    console.log("submit values:", values)
    setSearchFormFilter({ ...values })
  }

  const searchInvalid = async (errors: FieldErrors<SearchFormValues>) => {
    console.log("submit error:", errors)
  }

  const inputValid = async (values: InputFormValues) => {
    console.log("submit values:", values)
    try {
      // await updateImageGroup({
      //   variables: {
      //     input: {
      //       id: values.id,
      //       name: values.name,
      //       imageIds: []
      //     }
      //   }
      // })
    } catch (error) {
      console.error(error)
    }
  }

  const inputInvalid = async (errors: FieldErrors<InputFormValues>) => {
    console.log("submit error:", errors)
  }

  const searchFormImages = useMemo(() => {
    if (!imagesData) {
      return []
    }
    const edges = imagesData.images.edges
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
  }, [imagesData])

  const baseFormImages = useMemo(() => {
    if (!imageGroupData) {
      return []
    }

    const edges = imageGroupData.imageGroup.images.edges
    const data = edges.map((imageEdge) => {
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
    membership.action.initialize(data)
    return data
  }, [imageGroupData])

  useEffect(() => {
    if (!imageGroupData) {
      return
    }

    const imageGroup = imageGroupData.imageGroup
    inputFormMethod.reset({
      id: imageGroup.id,
      name: imageGroup.name,
    })
  }, [imageGroupData])

  const handleDeleteImageGroup = (id: string) => {}

  return (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ResizeSplitView
        defaultLayout={{ left: 50, right: 50 }}
        style={{
          flex: 1,
          marginBottom: "var(--mantine-spacing-xs)",
        }}
      >
        <ResizeSplitView.Left>
          <form
            onSubmit={searchFormMethod.handleSubmit(searchValid, searchInvalid)}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Flex justify="space-between" align="center" mb="xs" gap="xs">
              <Controller
                name="tags"
                control={searchFormMethod.control}
                render={({ field }) => (
                  <TagsInput
                    {...field}
                    size="xs"
                    placeholder={t("placeholder.tag")}
                    leftSection={<IconSearch size={16} />}
                    clearable
                    flex="1"
                  />
                )}
              />
              <Button size="xs" type="submit">
                {t("button.search")}
              </Button>
            </Flex>
            <ContentLayout>
              <ContentLayout.Grid>
                {searchFormImages.map((image) => {
                  const status = membership.value.getStatus(image.id)
                  return (
                    <ThumbnailBox key={image.id}>
                      {status === "none" && (
                        <>
                          <ThumbnailBox.AddButton
                            onClick={() => {
                              membership.control.add(image)
                            }}
                          />
                        </>
                      )}
                      {status === "existing" && (
                        <ThumbnailBox.Overlay bdrs="sm">
                          <ThumbnailBox.SelectedIcon />
                        </ThumbnailBox.Overlay>
                      )}
                      {status === "added" && (
                        <ThumbnailBox.Overlay bdrs="sm">
                          <ThumbnailBox.AddedIcon />
                        </ThumbnailBox.Overlay>
                      )}
                      {status === "removed" && (
                        <>
                          <ThumbnailBox.AddButton
                            onClick={() => {
                              membership.control.add(image)
                            }}
                          />
                          <ThumbnailBox.RemovedIcon />
                        </>
                      )}
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src={image.image.thumbnail}
                      />
                    </ThumbnailBox>
                  )
                })}
                <ContentLayout.Intersection ref={searchFormIntersection.ref} />
              </ContentLayout.Grid>
            </ContentLayout>
          </form>
        </ResizeSplitView.Left>
        <ResizeSplitView.Separator />
        <ResizeSplitView.Right>
          <form
            onSubmit={inputFormMethod.handleSubmit(inputValid, inputInvalid)}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Flex justify="space-between" align="center" mb="xs">
              <Controller
                control={inputFormMethod.control}
                name={`name`}
                render={({ field }) => (
                  <TextInput size="xs" placeholder="グループ名" {...field} />
                )}
              />
              <Flex align="center" gap="xs">
                <ButtonGroup>
                  <Button
                    size="xs"
                    type="button"
                    onClick={() => handleDeleteImageGroup("")}
                  >
                    {t("button.delete")}
                  </Button>
                </ButtonGroup>
              </Flex>
            </Flex>
            <ContentLayout>
              <ContentLayout.Grid>
                {membership.value.items.final.map((image) => {
                  const status = membership.value.getStatus(image.id)
                  return (
                    <ThumbnailBox key={image.id}>
                      {status === "existing" && (
                        <>
                          <ThumbnailBox.RemoveButton
                            onClick={() => membership.control.remove(image.id)}
                          />
                          <ThumbnailBox.SelectedIcon />
                        </>
                      )}
                      {status === "added" && (
                        <>
                          <ThumbnailBox.RemoveButton
                            onClick={() => membership.control.remove(image.id)}
                          />
                          <ThumbnailBox.AddedIcon />
                        </>
                      )}
                      {status === "removed" && (
                        <ThumbnailBox.Overlay bdrs="sm">
                          <ThumbnailBox.RemovedIcon />
                        </ThumbnailBox.Overlay>
                      )}
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src={image.image.thumbnail}
                      />
                    </ThumbnailBox>
                  )
                })}
                <ContentLayout.Intersection ref={inputFormIntersection.ref} />
              </ContentLayout.Grid>
            </ContentLayout>
            <ActionPanel mt="xs">
              <ActionPanel.Left></ActionPanel.Left>
              <ActionPanel.Center></ActionPanel.Center>
              <ActionPanel.Right>
                <ButtonGroup>
                  <Button size="xs" type="submit">
                    {t("button.update")}
                  </Button>
                </ButtonGroup>
              </ActionPanel.Right>
            </ActionPanel>
          </form>
        </ResizeSplitView.Right>
      </ResizeSplitView>
    </Box>
  )
}
export default Page
