"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  ResizeSplitView,
} from "@/components"
import { ThumbnailBox } from "@/feature"
import {
  useDeleteImageGroupMutation,
  useGetImageGroupQuery,
  useGetImagesQuery,
  useUpdateImageGroupMutation,
} from "@/graphql"
import { useIntersection, useUriParams } from "@/hooks"
import { createFormDefaults } from "@/lib/form"
import { imageDetailPayloadMapper } from "@/lib/mapping"
import { resolveUri } from "@/lib/url"
import {
  ImageDetailPayload,
  useConfirmContext,
  useFeedbackContext,
} from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Flex, TagsInput, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { t } from "i18next"
import { useRouter } from "next/navigation"
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
  // NOTE: useImageGroupMembership で追加・削除する画像を管理しているためrhfでは管理しない
})

type InputFormValues = z.infer<typeof inputFormSchema>

const inputFormDefaultValues = createFormDefaults<InputFormValues>({
  id: "",
  name: "",
})

const Page = () => {
  const uriParams = useUriParams<PathParam>()
  const router = useRouter()

  const membership = useImageGroupMembership<ImageDetailPayload>({ items: [] })
  const feedback = useFeedbackContext()
  const confirm = useConfirmContext()

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

  const searchValid = async (values: SearchFormValues) => {
    console.log("submit values:", values)
    setSearchFormFilter({ ...values })
  }

  const searchInvalid = async (errors: FieldErrors<SearchFormValues>) => {
    console.log("submit error:", errors)
  }

  const [updateImageGroup] = useUpdateImageGroupMutation()

  const inputValid = async (values: InputFormValues) => {
    console.log("submit values:", values)
    try {
      await updateImageGroup({
        variables: {
          input: {
            id: values.id,
            name: values.name,
            addedImageIds: membership.value.ids.added,
            removedImageIds: membership.value.ids.removed,
          },
        },
      })
      feedback.action.success({
        title: "成功",
        body: "更新しました。",
      })
      router.push(resolveUri("/groups"))
    } catch (error) {
      console.error(error)
      feedback.action.error({
        title: "エラー",
        body: "更新に失敗しました。",
      })
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
    return edges.map((edge) => imageDetailPayloadMapper(edge.node))
  }, [imagesData])

  useEffect(() => {
    if (!imageGroupData) {
      return
    }

    const imageGroup = imageGroupData.imageGroup
    inputFormMethod.reset({
      id: imageGroup.id,
      name: imageGroup.name,
    })

    const edges = imageGroupData.imageGroup.images.edges
    const data = edges.map((imageEdge) => {
      const image = imageEdge.node
      return {
        id: image.id,
        info: {
          file: {
            name: image.file.name,
            size: image.file.size,
            date: image.createdAt,
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
  }, [imageGroupData])

  const [deleteImageGroup] = useDeleteImageGroupMutation()

  const handleDeleteImageGroup = async () => {
    const result = await confirm.action.confirm({
      body: "削除します。よろしいですか？",
    })

    if (result !== "confirmed") {
      return
    }

    try {
      await deleteImageGroup({
        variables: {
          input: {
            id: uriParams.id,
          },
        },
        update(cache) {
          cache.evict({
            id: cache.identify({ __typename: "ImageGroup", id: uriParams.id }),
          })
          cache.gc()
        },
      })

      feedback.action.success({
        title: "成功",
        body: "削除しました。",
      })
      router.push(resolveUri("/groups"))
    } catch (error) {
      console.error(error)
      feedback.action.error({
        title: "エラー",
        body: "削除に失敗しました。",
      })
    }
  }

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
                    onClick={handleDeleteImageGroup}
                  >
                    {t("button.delete")}
                  </Button>
                </ButtonGroup>
              </Flex>
            </Flex>
            <ContentLayout>
              <ContentLayout.Grid styles={{ root: { height: "100%" } }}>
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
