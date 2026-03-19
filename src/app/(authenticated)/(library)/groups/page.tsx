"use client"
import { ActionPanel, ImageLayout } from "@/components"
import { ImageGroup } from "@/feature"
import { useUriQuery } from "@/hooks"
import { createFormDefaults } from "@/lib/form"
import { resolveUriQuery } from "@/lib/url"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Flex, Text, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { t } from "i18next"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import z from "zod"
import { TAB_FIELDS, Tabs } from "../_components"

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
  const items = useMemo(() => {
    return []
  }, [])

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
        <Box w="100%">
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
                <Text size="xs">{`${items.length} 件`}</Text>
              </Flex>
            </ActionPanel.Right>
          </ActionPanel>
          <ImageLayout>
            <ImageLayout.Grid>
              <ImageGroup>
                <ImageGroup.CountBadge value={42} />
                <ImageGroup.ImageContainer>
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail1.webp"} />
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail2.webp"} />
                </ImageGroup.ImageContainer>
                <ImageGroup.InfoContainer>
                  <ImageGroup.Title>グループ1</ImageGroup.Title>
                </ImageGroup.InfoContainer>
              </ImageGroup>
              <ImageGroup>
                <ImageGroup.CountBadge value={20} />
                <ImageGroup.ImageContainer>
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail1.webp"} />
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail2.webp"} />
                </ImageGroup.ImageContainer>
                <ImageGroup.InfoContainer>
                  <ImageGroup.Title>グループ1</ImageGroup.Title>
                </ImageGroup.InfoContainer>
              </ImageGroup>
              <ImageGroup ui={{ selected: true }}>
                <ImageGroup.CountBadge value={15} />
                <ImageGroup.ImageContainer>
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail1.webp"} />
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail2.webp"} />
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
                  <ImageGroup.Image bdrs="xs" src={"sample/thumbnail0.webp"} />
                </ImageGroup.ImageContainer>
                <ImageGroup.InfoContainer>
                  <ImageGroup.Title>グループ1</ImageGroup.Title>
                </ImageGroup.InfoContainer>
              </ImageGroup>
            </ImageLayout.Grid>
          </ImageLayout>
        </Box>
        {/* <Box>aa</Box> */}
      </Tabs.Panel>
    </Tabs>
  )
}

export default Page
