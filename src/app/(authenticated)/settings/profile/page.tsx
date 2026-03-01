"use client"
import { ActionPanel, FormButton } from "@/components"
import { Form } from "@/components/Form"
import { useGetUserProfileQuery, useUpdateProfileMutation } from "@/graphql"
import {
  useFormInteractivity,
  useMutationNotifier,
  useQueryNotifier,
  useSetFormDataFromQuery,
} from "@/hooks"
import { createFormSubmitHandler } from "@/lib"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { SettingSectionDivider, SettingSectionTitle } from "../_components"

import {
  ProfileInputForm,
  profileInputFormDefaultValue,
  profileInputFormSchema,
} from "./_components"

const Page = () => {
  const query = useGetUserProfileQuery()
  const [updateProfileMutation, mutation] = useUpdateProfileMutation()

  useQueryNotifier(query)
  useMutationNotifier(mutation)
  const interactivity = useFormInteractivity({ read: query, write: mutation })

  const form = useForm({
    resolver: zodResolver(profileInputFormSchema),
    mode: "onChange",
    defaultValues: {
      ...profileInputFormDefaultValue,
    },
  })

  useSetFormDataFromQuery({
    query,
    form,
    selector: (value) => {
      return { ...value.me.profile }
    },
  })

  const submit = createFormSubmitHandler(form, (value) => {
    return updateProfileMutation({
      variables: {
        input: {
          name: value.name,
          email: value.email,
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocKIWVfiXpZwpTYPahJMVMWgY4FXh3_tEC_FVoSCPrb0jnprqSxr=s96-c",
        },
      },
    })
  })

  return (
    <>
      <SettingSectionTitle>Profile</SettingSectionTitle>
      <SettingSectionDivider />
      <Form>
        <Form.Container>
          <Form.LoadingOverlay visible={query.loading} />
          <FormProvider {...form}>
            <Form.Group onSubmit={submit}>
              <ProfileInputForm {...interactivity} />
              <ActionPanel>
                <ActionPanel.Right>
                  <Form.Submit
                    button={(props) => (
                      <FormButton {...props} {...interactivity}>
                        更新
                      </FormButton>
                    )}
                  />
                </ActionPanel.Right>
              </ActionPanel>
            </Form.Group>
          </FormProvider>
        </Form.Container>
      </Form>
    </>
  )
}

export default Page
