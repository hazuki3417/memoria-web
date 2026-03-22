"use client"
import {
  ActionPanel,
  ButtonGroup,
  ContentLayout,
  ResizeSplitView,
} from "@/components"
import { ImageGroup, ThumbnailBox } from "@/feature"
import { useLocalStorage, useUriQuery } from "@/hooks"
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
  key: z.string(),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

const searchFormDefaultValues = createFormDefaults<SearchFormValues>({
  key: "",
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

  const searchValid = async (values: SearchFormValues) => {
    console.log("submit values:", values)
    router.push(resolveUriQuery({ ...values }))
  }

  const searchInvalid = async (errors: FieldErrors<SearchFormValues>) => {
    console.log("submit error:", errors)
  }

  const [selected, setSelected] = useState<string | null>(null)

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

  const handleSelect = (id: string) => {
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
    return []
  }, [])

  const images = useMemo(() => {
    return [
      {
        id: "edge.node.id",
        info: {
          file: {
            name: "example",
            size: 1000,
            date: "",
          },
          image: {
            width: 100,
            height: 200,
          },
          tags: [],
        },
        image: {
          preview: "sample/h.png",
          thumbnail: "sample/thumbnail.webp",
          alt: "",
        },
      } satisfies ImageDetailPayload,
    ]
  }, [])

  const handleEditGroup = async (id: string) => {
    router.push(
      resolveUri("/groups/:id/edit", {
        path: {
          id: id,
        },
      }),
    )
  }

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
                          name="key"
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
                    <ImageGroup
                      onClick={() => handleSelect("group1")}
                      ui={{ selected: selected === "group1" }}
                    >
                      <ImageGroup.CountBadge value={42} />
                      <ImageGroup.ImageContainer>
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail1.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail2.webp"}
                        />
                      </ImageGroup.ImageContainer>
                      <ImageGroup.InfoContainer>
                        <ImageGroup.Title>グループ1</ImageGroup.Title>
                      </ImageGroup.InfoContainer>
                    </ImageGroup>
                    <ImageGroup
                      onClick={() => handleSelect("group2")}
                      ui={{ selected: selected === "group2" }}
                    >
                      <ImageGroup.CountBadge value={20} />
                      <ImageGroup.ImageContainer>
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail1.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail2.webp"}
                        />
                      </ImageGroup.ImageContainer>
                      <ImageGroup.InfoContainer>
                        <ImageGroup.Title>グループ2</ImageGroup.Title>
                      </ImageGroup.InfoContainer>
                    </ImageGroup>
                    <ImageGroup
                      onClick={() => handleSelect("group3")}
                      ui={{ selected: selected === "group3" }}
                    >
                      <ImageGroup.CountBadge value={15} />
                      <ImageGroup.ImageContainer>
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail1.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail2.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                      </ImageGroup.ImageContainer>
                      <ImageGroup.InfoContainer>
                        <ImageGroup.Title>グループ3</ImageGroup.Title>
                      </ImageGroup.InfoContainer>
                    </ImageGroup>
                    <ImageGroup
                      onClick={() => handleSelect("group4")}
                      ui={{ selected: selected === "group4" }}
                    >
                      <ImageGroup.CountBadge value={15} />
                      <ImageGroup.ImageContainer>
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail1.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail2.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                      </ImageGroup.ImageContainer>
                      <ImageGroup.InfoContainer>
                        <ImageGroup.Title>グループ4</ImageGroup.Title>
                      </ImageGroup.InfoContainer>
                    </ImageGroup>
                    <ImageGroup
                      onClick={() => handleSelect("group5")}
                      ui={{ selected: selected === "group5" }}
                    >
                      <ImageGroup.CountBadge value={15} />
                      <ImageGroup.ImageContainer>
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail1.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail2.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                      </ImageGroup.ImageContainer>
                      <ImageGroup.InfoContainer>
                        <ImageGroup.Title>グループ5</ImageGroup.Title>
                      </ImageGroup.InfoContainer>
                    </ImageGroup>
                    <ImageGroup
                      onClick={() => handleSelect("group6")}
                      ui={{ selected: selected === "group6" }}
                    >
                      <ImageGroup.CountBadge value={15} />
                      <ImageGroup.ImageContainer>
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail1.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail2.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                        <ImageGroup.Image
                          bdrs="sm"
                          src={"sample/thumbnail0.webp"}
                        />
                      </ImageGroup.ImageContainer>
                      <ImageGroup.InfoContainer>
                        <ImageGroup.Title>グループ6</ImageGroup.Title>
                      </ImageGroup.InfoContainer>
                    </ImageGroup>
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
              <Box
                style={(theme) => ({
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: theme.radius.xs,
                })}
              >
                <Flex p="xs" justify="space-between" align="center">
                  <Title order={4}>グループ1</Title>
                  <ButtonGroup>
                    <Button
                      size="xs"
                      leftSection={<IconEdit size={16} />}
                      onClick={() => handleEditGroup("5678")}
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
                    <ThumbnailBox
                      onClick={() => {
                        imageDetailModalContext.control.open({
                          id: images[0].id,
                          getImages: () => images,
                        })
                      }}
                    >
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                    <ThumbnailBox>
                      <ThumbnailBox.Image
                        bdrs="sm"
                        src="sample/thumbnail0.webp"
                      />
                    </ThumbnailBox>
                  </ContentLayout.Grid>
                </ContentLayout>
              </Box>
            </motion.div>
          </ResizeSplitView.Panel>
        </ResizeSplitView>
      </Tabs.Panel>
    </Tabs>
  )
}

export default Page
