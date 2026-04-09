"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  LinkButton,
} from "@/components"
import { ThumbnailBox } from "@/feature"
import {
  useCreateImageGroupMutation,
  useDeleteImagesMutation,
  useDownloadImagesMutation,
  useGetImagesQuery,
} from "@/graphql"
import { useCollectionSelection, useIntersection, useUriQuery } from "@/hooks"
import { action } from "@/lib/action"
import { createFormDefaults } from "@/lib/form"
import { imageDetailPayloadMapper } from "@/lib/mapping"
import { resolveUri, resolveUriQuery } from "@/lib/url"
import {
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
  Modal,
  SegmentedControl,
  TagsInput,
  Text,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconBoxMultiple,
  IconCheckbox,
  IconDownload,
  IconEdit,
  IconEye,
  IconLibraryPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react"
import { t } from "i18next"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { z } from "zod"
import { TAB_FIELDS, Tabs } from "../_components"
import { CreateImageGroupForm, ImageGroupInputFormValues } from "./_components"
const searchFormSchema = z.object({
  tags: z.array(z.string()),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const searchFormDefaultValues = createFormDefaults<SearchFormValues>({
  tags: [],
})

const Page = () => {
  const query = useUriQuery<SearchFormValues>()
  const router = useRouter()

  const feedback = useFeedbackContext()
  const confirm = useConfirmContext()

  const imageDetailModalContext = useImageDetailModalContext()

  const [mode, setMode] = useState<"view" | "bulk">("view")
  const [opened, { open, close }] = useDisclosure(false)

  const methods = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      ...searchFormDefaultValues({ ...query }),
    },
  })
  const { handleSubmit, control } = methods

  const filter = {
    tags: query === undefined ? [] : query.tags,
  }

  const { data, fetchMore } = useGetImagesQuery({
    variables: {
      first: 100,
      filter,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only", // 一時的にキャッシュを無効化。API側で更新系のmutationで更新後の情報を返す実装に変更する必要あり（キャッシュ更新のため）
  })

  const intersection = useIntersection({
    intersect: async () => {
      const pageInfo = data?.images.pageInfo
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

    const edges = data.images.edges

    return edges.map((edge) => imageDetailPayloadMapper(edge.node))
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
    max: 100,
  })

  const hasSelectable = selection.value.size > 0

  const handleGroupImages = async () => {
    if (selection.value.max < selection.value.size) {
      feedback.action.warning({
        title: "一括操作（グループ化）",
        body: `${selection.value.max} 件以内に収まるよう選択してください。`,
      })
      return
    }
    open()
  }

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

    const file = res.data.downloadImages
    action.download({ url: file.url, fileName: file.name })
  }

  const [createImageGroup] = useCreateImageGroupMutation()

  const createImageGroupValid = async (values: ImageGroupInputFormValues) => {
    console.log("submit values:", values)

    await createImageGroup({
      variables: {
        input: {
          name: values.name,
          imageIds: values.ids,
        },
      },
    })
    feedback.action.success({
      title: "一括操作（グループ）",
      body: `${values.name} グループを作成しました。`,
    })
    close()
  }

  const createImageGroupInvalid = async (
    errors: FieldErrors<ImageGroupInputFormValues>,
  ) => {
    console.log("submit error:", errors)
    feedback.action.error({
      title: "一括操作（グループ）",
      body: `作成に失敗しました。`,
    })
  }

  return (
    <Tabs value={TAB_FIELDS.list}>
      <ActionPanel mb="xs">
        <ActionPanel.Left>
          <Tabs.List />
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
        <ActionPanel mb="xs" mih="36px">
          <ActionPanel.Left>
            {mode === "view" && (
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
                  indeterminate={selection.value.indeterminate}
                  checked={selection.value.allSelected}
                  onChange={(event) => {
                    if (
                      selection.value.allSelected ||
                      selection.value.indeterminate
                    ) {
                      selection.action.clear()
                      return
                    }
                    if (!selection.value.allSelected) {
                      selection.action.selectAll()
                      return
                    }
                  }}
                />
              </Flex>
            )}
          </ActionPanel.Left>
          <ActionPanel.Right>
            <Flex align="center" gap="xs">
              {mode === "view" && <Text size="xs">{`${items.length} 件`}</Text>}
              {mode === "bulk" && (
                <ButtonGroup>
                  <Button
                    size="xs"
                    leftSection={<IconBoxMultiple size={16} />}
                    disabled={!hasSelectable}
                    onClick={handleGroupImages}
                  >
                    {t("button.group")}
                  </Button>
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
                  const mode = value as "view" | "bulk"
                  if (mode === "view") {
                    // 一括選択 -> 絞り込みへの切り替えなので選択したアイテムをクリアする
                    selection.action.clear()
                  } else {
                    // 絞り込み -> 一括選択への切り替えなので検索条件はそのままにする
                  }
                  setMode(mode)
                }}
                data={[
                  {
                    value: "view",
                    label: (
                      <Center style={{ gap: 10 }}>
                        <IconEye size={16} />
                        <span>{t("label.view")}</span>
                      </Center>
                    ),
                  },
                  {
                    value: "bulk",
                    label: (
                      <Center style={{ gap: 10 }}>
                        <IconCheckbox size={16} />
                        <span>{t("label.action")}</span>
                      </Center>
                    ),
                  },
                ]}
              />
            </Flex>
          </ActionPanel.Right>
        </ActionPanel>
        <ContentLayout>
          <ContentLayout.Grid style={{ justifyContent: "center" }}>
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
                      const result = selection.action.toggle(item)
                      if (result) {
                        return
                      }
                      feedback.action.warning({
                        title: "一括操作（選択）",
                        body: `選択可能な数を超えています。`,
                      })
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
            <ContentLayout.Intersection
              h="160px"
              w="160px"
              ref={intersection.ref}
            />
          </ContentLayout.Grid>
        </ContentLayout>
      </Tabs.Panel>
      <Modal
        opened={opened}
        onClose={close}
        title="新規グループ作成"
        size="xl"
        centered
      >
        <CreateImageGroupForm
          items={selection.value.items}
          submitValid={createImageGroupValid}
          submitInvalid={createImageGroupInvalid}
        />
      </Modal>
    </Tabs>
  )
}

export default Page
