"use client"
import { ActionPanel, Image, LinkButton } from "@/components"
import { ImageLayout } from "@/components/ImageLayout/ImageLayout"
import { PreviewImageBox } from "@/feature"
import { useDeleteImagesMutation, useGetImagesQuery } from "@/graphql"
import { useUriQuery } from "@/hooks"
import { useRelayConnection } from "@/hooks/useRelayConnection"
import { defineFieldObject } from "@/lib/field"
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
  Box,
  Button,
  Center,
  Flex,
  ScrollArea,
  SegmentedControl,
  Tabs,
  TagsInput,
} from "@mantine/core"
import {
  IconCheckbox,
  IconDownload,
  IconEdit,
  IconLibraryPlus,
  IconListSearch,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react"
import { t } from "i18next"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, FieldErrors, FormProvider, useForm } from "react-hook-form"
import { z } from "zod"

const imageSearchFormSchema = z.object({
  tags: z.array(z.string()),
})

type ImageSearchFormSchema = z.infer<typeof imageSearchFormSchema>

const imageSearchFormDefaultValues = createFormDefaults<ImageSearchFormSchema>({
  tags: [],
})

const TAB_ID_LIST = ["list", "group"] as const
const TAB_FIELDS = defineFieldObject(TAB_ID_LIST)

const Page = () => {
  const query = useUriQuery<ImageSearchFormSchema>()
  const router = useRouter()

  const methods = useForm<ImageSearchFormSchema>({
    resolver: zodResolver(imageSearchFormSchema),
    defaultValues: {
      ...imageSearchFormDefaultValues({ ...query }),
    },
  })
  const { handleSubmit, control } = methods

  const feedback = useFeedbackContext()
  const confirm = useConfirmContext()
  const imageDetailModalContext = useImageDetailModalContext()
  const [mode, setMode] = useState<"filter" | "bulk">("filter")
  const [selectable, setSelectable] = useState<ImageDetailPayload["id"][]>([])

  const relay = useRelayConnection({
    hooks: () =>
      useGetImagesQuery({
        variables: {
          input: {
            conditions: {
              tags: query === undefined ? [] : query.tags,
            },
            pagination: {
              first: 100,
            },
          },
        },
        notifyOnNetworkStatusChange: true,
      }),
    extract: (data) => data.getImages,
    size: 10,
  })

  // const intersection = useIntersection({
  //   intersect: async () => {
  //     if (!relay.state.pageInfo?.hasNextPage) return
  //     const res = await relay.handler.next()
  //     setItems((prev) => [
  //       ...prev,
  //       ...res.data.getImages.edges.map((edge) => {
  //         return {
  //           id: edge.node.id,
  //           info: {
  //             file: {
  //               name: edge.node.info.file.name,
  //               size: String(edge.node.info.file.size),
  //               date: "",
  //             },
  //             image: {
  //               width: edge.node.info.size.width,
  //               height: edge.node.info.size.height,
  //             },
  //             tags: edge.node.info.tags,
  //           },
  //           image: {
  //             preview: edge.node.src.preview,
  //             thumbnail: edge.node.src.thumbnail,
  //             alt: edge.node.info.file.name,
  //           },
  //         }
  //       }),
  //     ])
  //   },
  // })

  const items = useMemo(() => {
    return relay.state.edges.map((edge) => {
      return {
        id: edge.node.id,
        info: {
          file: {
            name: edge.node.info.file.name,
            size: String(edge.node.info.file.size),
            date: "",
          },
          image: {
            width: edge.node.info.size.width,
            height: edge.node.info.size.height,
          },
          tags: edge.node.info.tags,
        },
        image: {
          preview: edge.node.src.preview,
          thumbnail: edge.node.src.thumbnail,
          alt: edge.node.info.file.name,
        },
      } satisfies ImageDetailPayload
    })
  }, [relay.state.edges])

  const searchValid = async (values: ImageSearchFormSchema) => {
    console.log("submit values:", values)
    router.push(resolveUriQuery({ ...values }))
  }

  const searchInvalid = async (errors: FieldErrors<ImageSearchFormSchema>) => {
    console.log("submit error:", errors)
  }

  const handleEditImages = async () => {
    console.debug("edit")
  }

  const [deleteImages] = useDeleteImagesMutation({
    update(cache, { data }) {
      const ids = data?.deleteImages.ids
      ids?.forEach((id) => {
        cache.evict({
          id: cache.identify({ __typename: "Image", id }),
        })
      })
      cache.gc()
    },
  })

  const handleDeleteImages = async () => {
    const result = await confirm.action.confirm({
      body: "削除します。よろしいですか？",
    })

    if (result !== "confirmed") {
      return
    }

    await deleteImages({
      variables: {
        input: {
          ids: selectable,
        },
      },
    })

    feedback.action.success({
      title: "成功",
      body: "削除しました。",
    })
    setSelectable([])
  }

  const handleDownloadImages = async () => {
    console.debug("edit")
  }

  return (
    <Box>
      <Tabs color="gray" variant="pills" defaultValue={TAB_FIELDS.list}>
        <Tabs.List mb="xs">
          <Tabs.Tab value={TAB_FIELDS.list}>{t("label.list")}</Tabs.Tab>
          <Tabs.Tab value={TAB_FIELDS.group}>{t("label.group")}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={TAB_FIELDS.list}>
          <ActionPanel mb="xs">
            <ActionPanel.Left>
              {mode === "filter" && (
                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(searchValid, searchInvalid)}
                    style={{ flex: 1 }}
                  >
                    <Flex align="center" gap="xs" w="100%">
                      <Controller
                        name="tags"
                        control={control}
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
                  </form>
                </FormProvider>
              )}
              {mode === "bulk" && (
                <Flex align="center" gap="xs">
                  <Button
                    size="xs"
                    leftSection={<IconEdit size={16} />}
                    onClick={handleEditImages}
                  >
                    {t("button.edit")}
                  </Button>
                  <Button
                    size="xs"
                    leftSection={<IconTrash size={16} />}
                    onClick={handleDeleteImages}
                  >
                    {t("button.delete")}
                  </Button>
                  <Button
                    size="xs"
                    leftSection={<IconDownload size={16} />}
                    onClick={handleDownloadImages}
                  >
                    {t("button.download")}
                  </Button>
                  <div>{selectable.length} 件選択中</div>
                </Flex>
              )}
            </ActionPanel.Left>
            <ActionPanel.Right>
              <Flex align="center" gap="xs">
                <LinkButton
                  size="xs"
                  leftSection={<IconLibraryPlus size={16} />}
                  href={resolveUri("/images/new")}
                >
                  {t("button.new")}
                </LinkButton>
                <SegmentedControl
                  value={mode}
                  onChange={(value) => {
                    const mode = value as "filter" | "bulk"
                    if (mode === "filter") {
                      // 一括選択 -> 絞り込みへの切り替えなので選択したアイテムをクリアする
                      setSelectable([])
                    } else {
                      // 絞り込み -> 一括選択への切り替えなので検索条件をクリアする
                    }
                    setMode(mode)
                  }}
                  data={[
                    {
                      value: "filter",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconListSearch size={16} />
                          <span>{t("label.filter")}</span>
                        </Center>
                      ),
                    },
                    {
                      value: "bulk",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconCheckbox size={16} />
                          <span>{t("label.bulk")}</span>
                        </Center>
                      ),
                    },
                  ]}
                />
              </Flex>
            </ActionPanel.Right>
          </ActionPanel>
          <ImageLayout>
            {/* FIX: スクロール仮実装 */}
            <ScrollArea h={"76vh"} scrollbarSize={6}>
              <ImageLayout.Grid>
                <Image>
                  {items.map((item) => {
                    return (
                      <PreviewImageBox
                        key={item.id}
                        ui={{
                          selected:
                            selectable.find((value) => value === item.id) !==
                            undefined,
                          selectable: mode === "bulk",
                          supported: true,
                        }}
                        onClick={() => {
                          if (mode === "bulk") {
                            const target = selectable.find(
                              (value) => value === item.id,
                            )

                            if (target === undefined) {
                              // 追加
                              setSelectable((prev) => [...prev, item.id])
                            } else {
                              // 除外
                              setSelectable((prev) =>
                                prev.filter((value) => value !== item.id),
                              )
                            }
                          } else {
                            // filter
                            imageDetailModalContext.control.open({
                              id: item.id,
                              getImages: () => items,
                            })
                          }
                        }}
                      >
                        <PreviewImageBox.Image
                          src={item.image.thumbnail}
                          alt={item.image.alt}
                        />
                      </PreviewImageBox>
                      // FIX: Image.Tile, Image.FrameとpreviewImageBoxの実装が類似しているので共通化を検討する
                      // <Image.Frame key={nanoid()}>
                      //   <Image.Tile
                      //     src={list.node.src.thumbnail}
                      //     alt={list.node.info.file.name}
                      //   />
                      // </Image.Frame>
                    )
                  })}
                  {/* NOTE: IntersectionObserverの監視対象は常に存在するようにする */}
                  {/* <Image.Intersection
                    ref={intersection.ref}
                    visible={relay.state.pageInfo?.hasNextPage || false}
                  /> */}
                </Image>
              </ImageLayout.Grid>
            </ScrollArea>
          </ImageLayout>
        </Tabs.Panel>
        <Tabs.Panel value={TAB_FIELDS.group}>group panel</Tabs.Panel>
      </Tabs>
    </Box>
  )
}

export default Page
