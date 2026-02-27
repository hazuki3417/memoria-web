"use client";
import { ActionPanel, FormButton } from "@/components";
import { Form } from "@/components/Form";
import {
  ProfileInputForm,
  profileInputFormDefaultValue,
  profileInputFormSchema,
} from "@/feature/setting/profile/ProfileInputForm";
import { useGetUserProfileQuery, useUpdateProfileMutation } from "@/graphql";
import {
  useFormInteractivity,
  useMutationNotifier,
  useQueryNotifier,
  useSetFormDataFromQuery,
} from "@/hooks";
import { createFormSubmitHandler } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { Space } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";

const Page = () => {
  const query = useGetUserProfileQuery();
  const [updateProfileMutation, mutation] = useUpdateProfileMutation();

  useQueryNotifier(query);
  useMutationNotifier(mutation);
  const interactivity = useFormInteractivity({ read: query, write: mutation });

  const form = useForm({
    resolver: zodResolver(profileInputFormSchema),
    mode: "onChange",
    defaultValues: {
      ...profileInputFormDefaultValue,
    },
  });

  useSetFormDataFromQuery({
    query,
    form,
    selector: (value) => {
      return { ...value.me.profile };
    },
  });

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
    });
  });

  return (
    <Form>
      <Form.Container p={8}>
        <Form.LoadingOverlay visible={query.loading} />
        <FormProvider {...form}>
          <Form.Group onSubmit={submit}>
            <ProfileInputForm {...interactivity} />
            <Space h={32} />
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
  );
};

export default Page;
