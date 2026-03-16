"use client"
import {
  ActionPanel,
  ButtonGroup,
  Image,
  ImageLayout,
  LinkButton,
} from "@/components"
import { ThumbnailBox } from "@/feature"
import {
  useDeleteImagesMutation,
  useDownloadImagesMutation,
  useGetImagesQuery,
} from "@/graphql"
import { useCollectionSelection, useIntersection, useUriQuery } from "@/hooks"
import { action } from "@/lib/action"
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
  Button,
  Center,
  Checkbox,
  Flex,
  ScrollArea,
  SegmentedControl,
  Tabs,
  TagsInput,
  Text,
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
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"

const searchFormSchema = z.object({
  tags: z.array(z.string()),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const searchFormDefaultValues = createFormDefaults<SearchFormValues>({
  tags: [],
})

const TAB_ID_LIST = ["list", "group"] as const
const TAB_FIELDS = defineFieldObject(TAB_ID_LIST)

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

  const feedback = useFeedbackContext()
  const confirm = useConfirmContext()
  const imageDetailModalContext = useImageDetailModalContext()
  const [mode, setMode] = useState<"filter" | "bulk">("filter")

  const filter = {
    tags: query === undefined ? [] : query.tags,
  }

  const { data, fetchMore } = useGetImagesQuery({
    variables: {
      first: 80,
      filter,
    },
    notifyOnNetworkStatusChange: true,
  })

  const intersection = useIntersection({
    intersect: async () => {
      const pageInfo = data?.getImages.pageInfo
      if (!pageInfo?.hasNextPage) return
      fetchMore({
        variables: {
          first: 50,
          after: pageInfo.endCursor,
          filter,
        },
      })
    },
  })

  const items = useMemo(() => {
    if (!data) {
      return []
    }

    const edges = data.getImages.edges

    return edges.map((edge) => {
      return {
        id: edge.node.id,
        info: {
          file: {
            name: edge.node.info.file.name,
            size: edge.node.info.file.size,
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
  }, [data])

  const searchValid = async (values: SearchFormValues) => {
    console.log("submit values:", values)
    router.push(resolveUriQuery({ ...values }))
  }

  const searchInvalid = async (errors: FieldErrors<SearchFormValues>) => {
    console.log("submit error:", errors)
  }

  const selection = useCollectionSelection({
    items,
    getKey: (item) => item.id,
    max: 30,
  })

  const hasSelectable = selection.value.size > 0

  const handleEditImages = async () => {
    if (selection.value.max < selection.value.size) {
      feedback.action.warning({
        title: "一括操作（編集）",
        body: `${selection.value.max} 件以内に収まるよう選択してください。`,
      })
      return
    }

    router.push(
      resolveUri("/images/edit", { query: { targets: selection.value.ids } }),
    )
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
    if (selection.value.max < selection.value.size) {
      feedback.action.warning({
        title: "一括操作（削除）",
        body: `${selection.value.max} 件以内に収まるよう選択してください。`,
      })
      return
    }

    const result = await confirm.action.confirm({
      body: "削除します。よろしいですか？",
    })

    if (result !== "confirmed") {
      return
    }

    await deleteImages({
      variables: {
        input: {
          ids: selection.value.ids,
        },
      },
    })

    feedback.action.success({
      title: "成功",
      body: "削除しました。",
    })
    selection.action.clear()
  }

  const [downloadImages] = useDownloadImagesMutation()

  const handleDownloadImages = async () => {
    if (selection.value.max < selection.value.size) {
      feedback.action.warning({
        title: "一括操作（ダウンロード）",
        body: `${selection.value.max} 件以内に収まるよう選択してください。`,
      })
      return
    }

    const res = await downloadImages({
      variables: {
        input: { ids: selection.value.ids },
      },
    })

    if (!res.data) {
      return
    }

    const downloadUrl = res.data.downloadImages
    action.download({ url: downloadUrl.url, fileName: downloadUrl.fileName })
  }

  return (
    <Tabs
      color="gray"
      variant="pills"
      defaultValue={TAB_FIELDS.list}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <ActionPanel mb="xs">
        <ActionPanel.Left>
          <Tabs.List>
            <Tabs.Tab value={TAB_FIELDS.list}>{t("label.list")}</Tabs.Tab>
            <Tabs.Tab value={TAB_FIELDS.group}>{t("label.group")}</Tabs.Tab>
          </Tabs.List>
        </ActionPanel.Left>
        <ActionPanel.Center></ActionPanel.Center>
        <ActionPanel.Right>
          <LinkButton
            size="xs"
            leftSection={<IconLibraryPlus size={16} />}
            href={resolveUri("/images/new")}
          >
            {t("button.new")}
          </LinkButton>
        </ActionPanel.Right>
      </ActionPanel>
      <Tabs.Panel
        value={TAB_FIELDS.list}
        style={{
          display: "flex",
          flex: "1",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <ActionPanel mb="xs">
          <ActionPanel.Left>
            {mode === "filter" && (
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
            )}
            {mode === "bulk" && (
              <Flex align="center" gap="xs">
                <Checkbox
                  size="xs"
                  variant="filled"
                  color="blue"
                  label={`選択：${selection.value.size} / ${selection.value.max}`}
                  checked={selection.value.allSelected}
                  indeterminate={selection.value.indeterminate}
                  onChange={(event) =>
                    event.currentTarget.checked
                      ? selection.action.selectAll()
                      : selection.action.clear()
                  }
                />
                <div></div>
              </Flex>
            )}
          </ActionPanel.Left>
          <ActionPanel.Right>
            <Flex align="center" gap="xs">
              {mode === "filter" && <Text size="xs">{`${items.length} 件`}</Text>}
              {mode === "bulk" && (
                <ButtonGroup>
                  <Button
                    size="xs"
                    leftSection={<IconEdit size={16} />}
                    disabled={!hasSelectable}
                    onClick={handleEditImages}
                  >
                    {t("button.edit")}
                  </Button>
                  <Button
                    size="xs"
                    leftSection={<IconTrash size={16} />}
                    disabled={!hasSelectable}
                    onClick={handleDeleteImages}
                  >
                    {t("button.delete")}
                  </Button>
                  <Button
                    size="xs"
                    leftSection={<IconDownload size={16} />}
                    disabled={!hasSelectable}
                    onClick={handleDownloadImages}
                  >
                    {t("button.download")}
                  </Button>
                </ButtonGroup>
              )}
              <SegmentedControl
                value={mode}
                onChange={(value) => {
                  const mode = value as "filter" | "bulk"
                  if (mode === "filter") {
                    // 一括選択 -> 絞り込みへの切り替えなので選択したアイテムをクリアする
                    selection.action.clear()
                  } else {
                    // 絞り込み -> 一括選択への切り替えなので検索条件はそのままにする
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
          <ScrollArea flex={1} scrollbarSize={6}>
            <ImageLayout.Grid>
              <Image>
                {items.map((item) => {
                  return (
                    <ThumbnailBox
                      key={item.id}
                      ui={{
                        selected: selection.value.ids.includes(item.id),
                        selectable: mode === "bulk",
                      }}
                      onClick={() => {
                        if (mode === "bulk") {
                          selection.action.toggle(item)
                        } else {
                          // filter
                          imageDetailModalContext.control.open({
                            id: item.id,
                            getImages: () => items,
                          })
                        }
                      }}
                    >
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src={item.image.thumbnail}
                        alt={item.image.alt}
                      />
                    </ThumbnailBox>
                  )
                })}
                {/* NOTE: IntersectionObserverの監視対象は常に存在するようにする */}
                <Image.Intersection
                  ref={intersection.ref}
                  visible={data?.getImages.pageInfo.hasNextPage || false}
                />
              </Image>
            </ImageLayout.Grid>
          </ScrollArea>
        </ImageLayout>
        {/* </Flex> */}
      </Tabs.Panel>
      <Tabs.Panel value={TAB_FIELDS.group} flex={1}>
        group panel
      </Tabs.Panel>
    </Tabs>
  )
}

export default Page
