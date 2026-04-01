"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  ResizeSplitView,
} from "@/components"
import { ThumbnailBox } from "@/feature"
import { useCreateImageGroupMutation, useGetImagesQuery } from "@/graphql"
import { useIntersection } from "@/hooks"
import { createFormDefaults } from "@/lib/form"
import { imageDetailPayloadMapper } from "@/lib/mapping"
import { resolveUri } from "@/lib/url"
import { ImageDetailPayload, useFeedbackContext } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Flex, TagsInput, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { t } from "i18next"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import z from "zod"
import { useImageGroupMembership } from "../_components"

const searchFormSchema = z.object({
  tags: z.array(z.string()),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const searchFormDefaultValues = createFormDefaults<SearchFormValues>({
  tags: [],
})

const inputFormSchema = z.object({
  name: z.string(),
  // NOTE: useImageGroupMembership で追加・削除する画像を管理しているためrhfでは管理しない
})

type InputFormValues = z.infer<typeof inputFormSchema>

const inputFormDefaultValues = createFormDefaults<InputFormValues>({
  name: "",
})

const Page = () => {
  const router = useRouter()

  const membership = useImageGroupMembership<ImageDetailPayload>({ items: [] })
  const feedback = useFeedbackContext()

  const searchFormMethod = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      ...searchFormDefaultValues(),
    },
  })

  const inputFormMethod = useForm<InputFormValues>({
    resolver: zodResolver(inputFormSchema),
    defaultValues: {
      ...inputFormDefaultValues(),
    },
  })

  const [searchFormFilter, setSearchFormFilter] = useState<SearchFormValues>({
    ...searchFormDefaultValues(),
  })

  const { data: imagesData, fetchMore: fetchMoreImages } = useGetImagesQuery({
    variables: {
      first: 100,
      filter: searchFormFilter,
    },
    notifyOnNetworkStatusChange: true,
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

  const searchValid = async (values: SearchFormValues) => {
    console.log("submit values:", values)
    setSearchFormFilter({ ...values })
  }

  const searchInvalid = async (errors: FieldErrors<SearchFormValues>) => {
    console.log("submit error:", errors)
  }

  const [createImageGroup] = useCreateImageGroupMutation()

  const inputValid = async (values: InputFormValues) => {
    console.log("submit values:", values)
    try {
      await createImageGroup({
        variables: {
          input: {
            name: values.name,
            imageIds: membership.value.ids.final,
          },
        },
      })
      feedback.action.success({
        title: "成功",
        body: "作成しました。",
      })
      router.push(resolveUri("/groups"))
    } catch (error) {
      console.error(error)
      feedback.action.error({
        title: "エラー",
        body: "作成に失敗しました。",
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
                {/** NOTE: 必要に応じてボタンを配置 */}
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
              </ContentLayout.Grid>
            </ContentLayout>
            <ActionPanel mt="xs">
              <ActionPanel.Left></ActionPanel.Left>
              <ActionPanel.Center></ActionPanel.Center>
              <ActionPanel.Right>
                <ButtonGroup>
                  <Button size="xs" type="submit">
                    {t("button.create")}
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
