"use client"
import { ActionPanel } from "@/components"
import { useGetUserProfileQuery, useUpdateProfileMutation } from "@/graphql"
import { useFeedbackContext } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { IconDatabase, IconUpload } from "@tabler/icons-react"
import { useEffect } from "react"
import { FieldErrors, FormProvider, useForm } from "react-hook-form"
import z from "zod"
import { SettingSectionDivider, SettingSectionTitle } from "../_components"

const profileInputFormSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().nonempty(),
})

type ProfileInputFormValues = z.infer<typeof profileInputFormSchema>

const profileInputFormDefaultValue: ProfileInputFormValues = {
  name: "",
  email: "",
}

const Page = () => {
  const getProfile = useGetUserProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()

  const methods = useForm<ProfileInputFormValues>({
    resolver: zodResolver(profileInputFormSchema),
    defaultValues: {
      ...profileInputFormDefaultValue,
    },
  })

  const { register, handleSubmit, reset } = methods

  const feedback = useFeedbackContext()

  useEffect(() => {
    if (getProfile.data) {
      const formData = getProfile.data.me.profile
      reset({
        ...formData,
      })
    }
  }, [getProfile.data, reset])

  const inputValid = async (values: ProfileInputFormValues) => {
    console.log("submit values:", values)

    await updateProfile({
      variables: {
        input: {
          ...values,
        },
      },
    })

    feedback.action.success({
      title: "保存",
      body: "正常に終了しました。",
    })
  }

  const inputInValid = (errors: FieldErrors<ProfileInputFormValues>) => {
    console.log("submit error:", errors)
  }

  return (
    <>
      <SettingSectionTitle>Profile</SettingSectionTitle>
      <SettingSectionDivider />
      <Flex gap="lg">
        <Box flex="1">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(inputValid, inputInValid)}>
              <Stack gap="md" mb="xs">
                <TextInput
                  size="xs"
                  withAsterisk
                  {...register("name")}
                  label="Name"
                  placeholder="John Doe"
                />
                <TextInput
                  size="xs"
                  withAsterisk
                  {...register("email")}
                  label="E-mail"
                  placeholder="john.doe@memoria.com"
                />
                <Select
                  size="xs"
                  label="言語"
                  placeholder="lan"
                  defaultValue={"jp"}
                  data={[
                    { label: "Japanese", value: "jp" },
                    { label: "English", value: "en" },
                  ]}
                />
              </Stack>
              <ActionPanel>
                <ActionPanel.Left></ActionPanel.Left>
                <ActionPanel.Center></ActionPanel.Center>
                <ActionPanel.Right>
                  <Button size="xs" type="submit">
                    保存
                  </Button>
                </ActionPanel.Right>
              </ActionPanel>
            </form>
          </FormProvider>
        </Box>
        <Box flex="1">
          <Stack gap="md">
            <Paper shadow="xs" withBorder>
              <Group gap={4} p="xs">
                <IconUpload size={16} />
                <Title order={6}>アップロード制限</Title>
              </Group>
              <Divider />
              <Box
                p="xs"
                style={(theme) => ({
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr",
                })}
              >
                <Box>
                  <Text size="xs">・ファイル数</Text>
                </Box>
                <Box>
                  <Text size="xs">：</Text>
                </Box>
                <Box>
                  <Text size="xs">20 件</Text>
                </Box>

                <Box>
                  <Text size="xs">・ファイルサイズ</Text>
                </Box>
                <Box>
                  <Text size="xs">：</Text>
                </Box>
                <Box>
                  <Text size="xs">100 MB / 1 件</Text>
                </Box>

                <Box>
                  <Text size="xs">・ファイルタイプ</Text>
                </Box>
                <Box>
                  <Text size="xs">：</Text>
                </Box>
                <Box>
                  <Text size="xs">jpg / png</Text>
                </Box>
              </Box>
            </Paper>

            <Paper shadow="xs" withBorder>
              <Group gap={4} p="xs">
                <IconDatabase size={16} />
                <Title order={6}>使用量</Title>
              </Group>
              <Divider />
              <Box
                p="xs"
                style={(theme) => ({
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr",
                })}
              >
                <Box>
                  <Text size="xs">・ファイル数</Text>
                </Box>
                <Box>
                  <Text size="xs">：</Text>
                </Box>
                <Box>
                  <Text size="xs">20 件</Text>
                </Box>

                <Box>
                  <Text size="xs">・ファイルサイズ</Text>
                </Box>
                <Box>
                  <Text size="xs">：</Text>
                </Box>
                <Box>
                  <Text size="xs">100 MB / 1 件</Text>
                </Box>

                <Box>
                  <Text size="xs">・ファイルタイプ</Text>
                </Box>
                <Box>
                  <Text size="xs">：</Text>
                </Box>
                <Box>
                  <Text size="xs">jpg / png</Text>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Flex>
    </>
  )
}

export default Page
