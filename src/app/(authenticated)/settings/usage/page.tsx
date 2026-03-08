"use client"
import { useGetUserProfileQuery, useUpdateProfileMutation } from "@/graphql"
import { useFeedbackContext } from "@/providers"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Flex, Stack } from "@mantine/core"
import { useEffect } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import z from "zod"
import { SettingSectionDivider, SettingSectionTitle } from "../_components"
import {
  FileCountInfoPanel,
  FileSizeInfoPanel,
  StorageInfoPanel,
  UploadInfoPanel,
} from "./_components"

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
          <Stack gap="md">
            <UploadInfoPanel mih={152} />
            <FileCountInfoPanel />
          </Stack>
        </Box>
        <Box flex="1">
          <Stack gap="md">
            <StorageInfoPanel mih={152} />
            <FileSizeInfoPanel />
          </Stack>
        </Box>
      </Flex>
    </>
  )
}

export default Page
