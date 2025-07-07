"use client";
import { ActionPanel } from "@/components/ActionPanel";
import { Form } from "@/components/Form";
import {
  ProfileInputForm,
  profileInputFormDefaultValue,
  profileInputFormSchema,
} from "@/feature/setting/profile/ProfileInputForm";
import { useGetUserProfileQuery, useUpdateProfileMutation } from "@/graphql";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  useFormInteractivity,
  useMutationNotifier,
  useQueryNotifier,
  useSetFormDataFromQuery,
} from "@/hooks";
import { FormButton } from "@/components";
import { Space } from "@mantine/core";
import { createFormSubmitHandler } from "@/lib";

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
            <ActionPanel
              right={
                <Form.Submit
                  button={(props) => (
                    <FormButton {...props} {...interactivity}>
                      更新
                    </FormButton>
                  )}
                />
              }
            />
          </Form.Group>
        </FormProvider>
      </Form.Container>
    </Form>
  );
};

export default Page;
