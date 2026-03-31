"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  LinkButton,
  ResizeSplitView,
  ResizeSplitViewLayout,
  useResizeSplitView,
} from "@/components"
import { ImageGroup, ThumbnailBox } from "@/feature"
import {
  useDeleteImageGroupMutation,
  useGetImageGroupLazyQuery,
  useGetImageGroupsQuery,
} from "@/graphql"
import { useIntersection, useLocalStorage, useUriQuery } from "@/hooks"
import { createFormDefaults } from "@/lib/form"
import { resolveUri, resolveUriQuery } from "@/lib/url"
import {
  ImageDetailPayload,
  useConfirmContext,
  useFeedbackContext,
  useImageDetailModalContext,
} from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import {
  IconDownload,
  IconEdit,
  IconLibraryPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { motion } from "framer-motion"
import { t } from "i18next"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import z from "zod"
import { TAB_FIELDS, Tabs } from "../_components"

const searchFormSchema = z.object({
  name: z.string(),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const searchFormDefaultValues = createFormDefaults<SearchFormValues>({
  name: "",
})

const Page = () => {
  const query = useUriQuery<SearchFormValues>()
  const router = useRouter()

  const feedback = useFeedbackContext()
  const confirm = useConfirmContext()

  const [selected, setSelected] = useState<string | null>(null)

  const methods = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      ...searchFormDefaultValues({ ...query }),
    },
  })
  const { handleSubmit, control } = methods

  const searchValid = async (values: SearchFormValues) => {
    console.log("submit values:", values)
    router.push(resolveUriQuery({ ...values }))
  }

  const searchInvalid = async (errors: FieldErrors<SearchFormValues>) => {
    console.log("submit error:", errors)
  }

  const imageGroupsfilter = {
    name: query === undefined ? "" : query.name,
  }

  const { data: imageGroupsData, fetchMore: fetchMoreImageGroups } =
    useGetImageGroupsQuery({
      variables: {
        first: 20,
        filter: imageGroupsfilter,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only", // 一時的にキャッシュを無効化。API側で更新系のmutationで更新後の情報を返す実装に変更する必要あり（キャッシュ更新のため）
    })

  const imageGroupsIntersection = useIntersection({
    intersect: async () => {
      console.debug("imageGroupsIntersection")
      const pageInfo = imageGroupsData?.imageGroups.pageInfo
      if (!pageInfo?.hasNextPage) return
      fetchMoreImageGroups({
        variables: {
          first: 50,
          after: pageInfo.endCursor,
          filter: imageGroupsfilter,
        },
      })
    },
  })

  const [
    getImageGroup,
    { data: imageGroupData, fetchMore: fetchMoreImageGroup },
  ] = useGetImageGroupLazyQuery()

  const imageGroupfilter = {
    id: selected ?? "",
  }

  const imageGroupIntersection = useIntersection({
    intersect: async () => {
      console.debug("imageGroupIntersection")

      const pageInfo = imageGroupData?.imageGroup.images.pageInfo
      if (!pageInfo?.hasNextPage) return
      fetchMoreImageGroup({
        variables: {
          first: 30,
          after: pageInfo.endCursor,
          filter: imageGroupfilter,
        },
      })
    },
  })

  const drawer = useMemo(() => {
    return selected !== null ? "opened" : "closed"
  }, [selected])

  const { groupRef, getLayout, setLayout } = useResizeSplitView()

  const size = useLocalStorage<ResizeSplitViewLayout>({
    init: { left: 50, right: 50 },
    key: "image-group-resize-split-view",
  })

  const handleLayoutChanged = (layout: ResizeSplitViewLayout) => {
    if (layout.right === 0) {
      return // NOTE: 右側を閉じている状態なら何もしない
    }
    size.action.set({ ...layout })
  }

  const handleSelect = async (id: string) => {
    await getImageGroup({
      variables: {
        first: 30,
        filter: { id },
      },
    })

    setSelected(id)

    const layout = getLayout()
    if (!layout) {
      return
    }
    if (layout.right !== 0) {
      return // NOTE: 右側が開いている状態なら現状のレイアウトを維持
    }

    // 右側が開いていない状態なら右側のパネルを表示

    setLayout({
      left: size.value.left,
      right: size.value.right,
    })
  }

  const handleClose = () => {
    setSelected(null)
    setLayout({
      left: 100,
      right: 0,
    })
  }

  const imageDetailModalContext = useImageDetailModalContext()

  const groups = useMemo(() => {
    if (!imageGroupsData) {
      return []
    }
    const edges = imageGroupsData.imageGroups.edges

    return edges.map((groupEdge) => {
      const group = groupEdge.node
      return {
        id: group.id,
        name: group.name,
        count: group.count,
        thumbnails: group.thumbnails,
      }
    })
  }, [imageGroupsData])

  const imageGroup = imageGroupData?.imageGroup

  const images = useMemo(() => {
    if (!imageGroupData) {
      return []
    }
    const edges = imageGroupData.imageGroup.images.edges
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
  }, [imageGroupData])

  const handleEditImageGroup = async (id: string) => {
    router.push(
      resolveUri("/groups/:id/edit", {
        path: {
          id: id,
        },
      }),
    )
  }

  const [deleteImageGroup] = useDeleteImageGroupMutation()

  const handleDeleteImageGroup = async (id: string) => {
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
            id,
          },
        },
        update(cache) {
          cache.evict({
            id: cache.identify({ __typename: "ImageGroup", id }),
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
    } finally {
      handleClose()
    }
  }

  const handleDownloadImageGroup = async (id: string) => {
    // TODO: ロジックを実装
  }

  return (
    <Tabs value={TAB_FIELDS.group}>
      <ActionPanel mb="xs">
        <ActionPanel.Left>
          <Tabs.List />
        </ActionPanel.Left>
        <ActionPanel.Center></ActionPanel.Center>
        <ActionPanel.Right>
          <LinkButton
            size="xs"
            leftSection={<IconLibraryPlus size={16} />}
            href={resolveUri("/groups/new")}
          >
            {t("button.new")}
          </LinkButton>
        </ActionPanel.Right>
      </ActionPanel>
      <Tabs.Panel
        style={{
          display: "flex",
          flex: "1",
          flexDirection: "column",
          overflow: "hidden",
        }}
        value={TAB_FIELDS.group}
      >
        <ResizeSplitView
          groupRef={groupRef}
          defaultLayout={{ left: 100, right: 0 }}
          onLayoutChanged={handleLayoutChanged}
        >
          <ResizeSplitView.Left>
            {/* NOTE: right panelのmotion.div相当の要素 */}
            <Box
              style={(theme) => ({
                height: "100%",
              })}
            >
              <Box
                style={(theme) => ({
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: theme.radius.xs,
                })}
              >
                <ActionPanel mb="xs" mih="36px">
                  <ActionPanel.Left>
                    <form
                      onSubmit={handleSubmit(searchValid, searchInvalid)}
                      style={{ flex: 1 }}
                    >
                      <Flex align="center" gap="xs" w="100%">
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              size="xs"
                              placeholder={t("placeholder.group")}
                              leftSection={<IconSearch size={16} />}
                              flex="1"
                            />
                            // TODO: clearの実装
                          )}
                        />
                        <Button size="xs" type="submit">
                          {t("button.search")}
                        </Button>
                      </Flex>
                    </form>
                  </ActionPanel.Left>
                  <ActionPanel.Right>
                    <Flex align="center" gap="xs">
                      <Text size="xs">{`${groups.length} 件`}</Text>
                    </Flex>
                  </ActionPanel.Right>
                </ActionPanel>
                <ContentLayout>
                  <ContentLayout.Grid>
                    {groups.map((group) => {
                      return (
                        <ImageGroup
                          key={group.id}
                          onClick={() => handleSelect(group.id)}
                          ui={{ selected: selected === group.id }}
                        >
                          <ImageGroup.ImageContainer>
                            {group.thumbnails.map((thumbnail) => {
                              return (
                                <ImageGroup.Image
                                  key={thumbnail}
                                  bdrs="sm"
                                  src={thumbnail}
                                />
                              )
                            })}
                            {[...Array(4 - group.thumbnails.length)].map(
                              (_, i) => (
                                <ImageGroup.ImageSkeleton
                                  key={i}
                                  animate={false}
                                />
                              ),
                            )}
                          </ImageGroup.ImageContainer>
                          <ImageGroup.InfoContainer>
                            <ImageGroup.Title>{group.name}</ImageGroup.Title>
                          </ImageGroup.InfoContainer>
                          <ImageGroup.CountBadge value={group.count} />
                        </ImageGroup>
                      )
                    })}
                    <ContentLayout.Intersection
                      h="360px"
                      w="330px"
                      ref={imageGroupsIntersection.ref}
                    />
                  </ContentLayout.Grid>
                </ContentLayout>
              </Box>
            </Box>
          </ResizeSplitView.Left>
          <ResizeSplitView.Separator visible={drawer === "opened"} />
          <ResizeSplitView.Right visible={drawer === "opened"}>
            <motion.div
              style={{ height: "100%" }}
              animate={{
                opacity: drawer === "opened" ? 1 : 0,
                x: drawer === "opened" ? 0 : 100,
              }}
              transition={{ duration: 0.3 }}
            >
              {imageGroup && (
                <Box
                  style={(theme) => ({
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: theme.radius.xs,
                  })}
                >
                  <Flex p="xs" justify="space-between" align="center">
                    <Title order={4}>{imageGroup.name}</Title>
                    <Flex align="center" gap="xs">
                      <Text size="xs">{`${imageGroup.count} 件`}</Text>
                      <ButtonGroup>
                        <Button
                          size="xs"
                          leftSection={<IconEdit size={16} />}
                          onClick={() => handleEditImageGroup(imageGroup.id)}
                        >
                          {t("button.edit")}
                        </Button>
                        <Button
                          size="xs"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handleDeleteImageGroup(imageGroup.id)}
                        >
                          {t("button.delete")}
                        </Button>
                        <Button
                          size="xs"
                          leftSection={<IconDownload size={16} />}
                          onClick={() =>
                            handleDownloadImageGroup(imageGroup.id)
                          }
                        >
                          {t("button.download")}
                        </Button>
                        <ActionIcon
                          color="gray"
                          size="input-xs"
                          variant="subtle"
                          data-testid="edit-info"
                          onClick={handleClose}
                        >
                          <IconX />
                        </ActionIcon>
                      </ButtonGroup>
                    </Flex>
                  </Flex>
                  <ContentLayout>
                    <ContentLayout.Grid style={{ justifyContent: "center" }}>
                      {images.map((image) => {
                        return (
                          <ThumbnailBox
                            key={image.id}
                            onClick={() => {
                              imageDetailModalContext.control.open({
                                id: image.id,
                                getImages: () => images,
                              })
                            }}
                          >
                            <ThumbnailBox.Image
                              bdrs="sm"
                              src={image.image.thumbnail}
                            />
                          </ThumbnailBox>
                        )
                      })}
                      <ContentLayout.Intersection
                        h="160px"
                        w="160px"
                        ref={imageGroupIntersection.ref}
                      />
                    </ContentLayout.Grid>
                  </ContentLayout>
                </Box>
              )}
            </motion.div>
          </ResizeSplitView.Right>
        </ResizeSplitView>
      </Tabs.Panel>
    </Tabs>
  )
}

export default Page
