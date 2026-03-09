"use client"
import { ActionPanel } from "@/components"
import { useGetProfileQuery, useUpdateProfileMutation } from "@/graphql"
import { useFeedbackContext } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Button, Flex, Select, Stack, TextInput } from "@mantine/core"
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
  const getProfile = useGetProfileQuery()
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
          <Stack gap="md"></Stack>
        </Box>
      </Flex>
    </>
  )
}

export default Page
