"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  ResizeSplitView,
} from "@/components"
import { ImageGroup, ThumbnailBox } from "@/feature"
import { useGetImageGroupLazyQuery, useGetImageGroupsQuery } from "@/graphql"
import { useIntersection, useLocalStorage, useUriQuery } from "@/hooks"
import { defineFieldObject } from "@/lib/field"
import { createFormDefaults } from "@/lib/form"
import { resolveUri, resolveUriQuery } from "@/lib/url"
import { ImageDetailPayload, useImageDetailModalContext } from "@/providers"
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
import { IconEdit, IconSearch, IconX } from "@tabler/icons-react"
import { motion } from "framer-motion"
import { t } from "i18next"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { Layout, useGroupRef } from "react-resizable-panels"
import z from "zod"
import { TAB_FIELDS, Tabs } from "../_components"

const PANEL_ID_LIST = ["left", "right"] as const
const PANEL_FIELDS = defineFieldObject(PANEL_ID_LIST)
type PanelSize = Record<(typeof PANEL_ID_LIST)[number], number>

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

  const methods = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      ...searchFormDefaultValues({ ...query }),
    },
  })
  const { handleSubmit, control } = methods

  const [selected, setSelected] = useState<string | null>(null)
  const searchValid = async (values: SearchFormValues) => {
    console.log("submit values:", values)
    router.push(resolveUriQuery({ ...values }))
  }

  const imageGroupsfilter = {
    name: query === undefined ? "" : query.name,
  }

  const { data: imageGroupsData, fetchMore: fetchMoreImageGroups } = useGetImageGroupsQuery({
    variables: {
      first: 10,
      filter: imageGroupsfilter,
    },
    notifyOnNetworkStatusChange: true,
  })

  const imageGroupsIntersection = useIntersection({
    intersect: async () => {
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

  const [getImageGroup, { data: imageGroupData, fetchMore: fetchMoreImageGroup }] = useGetImageGroupLazyQuery()

  const imageGroupfilter = {
    id: selected ?? "",
  }

  const imageGroupIntersection = useIntersection({
    intersect: async () => {
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

  const searchInvalid = async (errors: FieldErrors<SearchFormValues>) => {
    console.log("submit error:", errors)
  }

  const drawer = useMemo(() => {
    return selected !== null ? "opened" : "closed"
  }, [selected])

  const groupRef = useGroupRef()

  const size = useLocalStorage<PanelSize>({
    init: { left: 50, right: 50 },
    key: "image-group-resize-split-view",
  })

  const handleLayoutChanged = (layout: Layout) => {
    const ref = groupRef.current
    if (ref === null) {
      return
    }
    if (layout[PANEL_FIELDS.right] === 0) {
      return // NOTE: 右側を閉じている状態なら何もしない
    }
    size.action.set({
      left: layout[PANEL_FIELDS.left],
      right: layout[PANEL_FIELDS.right],
    })
  }

  const handleSelect = async (id: string) => {
    await getImageGroup({
      variables: {
        first: 30,
        filter: { id },
      },
    })

    setSelected(id)

    const ref = groupRef.current
    if (ref === null) {
      return
    }
    const layout = ref.getLayout()

    if (layout[PANEL_FIELDS.right] !== 0) {
      return // NOTE: 右側が開いている状態なら現状のレイアウトを維持
    }

    // 右側が開いていない状態なら右側のパネルを表示

    ref.setLayout({
      [PANEL_FIELDS.left]: size.value.left,
      [PANEL_FIELDS.right]: size.value.right,
    })

  }

  const handleClose = () => {
    setSelected(null)
    const ref = groupRef.current
    if (ref === null) {
      return
    }
    ref.setLayout({
      [PANEL_FIELDS.left]: 100,
      [PANEL_FIELDS.right]: 0,
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
        images: group.images.edges.map((imageEdge) => {
          const image = imageEdge.node
          return {
            thumbnail: image.src.thumbnail,
          }
        }),
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

  const handleEditGroup = async (id: string) => {
    router.push(
      resolveUri("/groups/:id/edit", {
        path: {
          id: id,
        },
      }),
    )
  }

  const intersectionVisible = imageGroupsData?.imageGroups.pageInfo.hasNextPage || false

  return (
    <Tabs value={TAB_FIELDS.group}>
      <ActionPanel mb="xs">
        <ActionPanel.Left>
          <Tabs.List />
        </ActionPanel.Left>
        <ActionPanel.Center></ActionPanel.Center>
        <ActionPanel.Right></ActionPanel.Right>
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
          onLayoutChanged={handleLayoutChanged}
        >
          <ResizeSplitView.Panel
            id={PANEL_FIELDS.left}
            defaultSize={100}
            style={{ marginRight: "8px" }}
          >
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
                          <ImageGroup.CountBadge value={group.count} />
                          <ImageGroup.ImageContainer>
                            {group.images.map((image) => {
                              return (
                                <ImageGroup.Image
                                  key={image.thumbnail}
                                  bdrs="sm"
                                  src={image.thumbnail}
                                />
                              )
                            })}
                          </ImageGroup.ImageContainer>
                          <ImageGroup.InfoContainer>
                            <ImageGroup.Title>{group.name}</ImageGroup.Title>
                          </ImageGroup.InfoContainer>
                        </ImageGroup>
                      )
                    })}
                    {intersectionVisible && (
                      <ContentLayout.Intersection
                        ref={imageGroupsIntersection.ref}
                      />
                    )}
                  </ContentLayout.Grid>
                </ContentLayout>
              </Box>
            </Box>
          </ResizeSplitView.Panel>
          <ResizeSplitView.Separator visible={drawer === "opened"} />
          <ResizeSplitView.Panel
            id={PANEL_FIELDS.right}
            defaultSize={0}
            visible={drawer === "opened"}
            style={{ marginLeft: "8px" }}
          >
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
                    <ButtonGroup>
                      <Button
                        size="xs"
                        leftSection={<IconEdit size={16} />}
                        onClick={() => handleEditGroup(imageGroup.id)}
                      >
                        {t("button.edit")}
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
                    </ContentLayout.Grid>
                  </ContentLayout>
                </Box>
              )}
            </motion.div>
          </ResizeSplitView.Panel>
        </ResizeSplitView>
      </Tabs.Panel>
    </Tabs>
  )
}

export default Page
