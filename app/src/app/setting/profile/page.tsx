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
import { Box, Button, LoadingOverlay } from "@mantine/core";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

const Page = () => {
  const read = useGetUserProfileQuery();

  const [updateProfileMutation, write] = useUpdateProfileMutation();

  const form = useForm({
    resolver: zodResolver(profileInputFormSchema),
    mode: "onChange",
    defaultValues: {
      ...profileInputFormDefaultValue,
    },
  });

  const submit = form.handleSubmit(async (value) => {
    console.debug("submit", value);
    try {
      const result = await updateProfileMutation({
        variables: {
          input: {
            name: value.name,
            email: value.email,
            picture:
              "https://lh3.googleusercontent.com/a/ACg8ocKIWVfiXpZwpTYPahJMVMWgY4FXh3_tEC_FVoSCPrb0jnprqSxr=s96-c",
          },
        },
      });
      result;

      console.log("更新成功:", result.data?.updateProfile);
    } catch (e) {
      console.error("更新失敗:", e);
    }
  });

  useEffect(() => {
    const { data } = read;
    if (data?.me.profile) {
      form.reset({
        ...data.me.profile,
      });
    }
  }, [read, form]);

  return (
    <Form>
      <Form.Container>
        <Form.LoadingOverlay visible={read.loading} />
        <FormProvider {...form}>
          <Form.Group onSubmit={submit}>
            <ProfileInputForm
              control={form.control}
              isSubmitting={form.formState.isSubmitting}
            />
          </Form.Group>
        </FormProvider>
        <ActionPanel
          right={
            <Form.Submit
              button={(props) => (
                <Button
                  {...props}
                  loading={form.formState.isSubmitting}
                  disabled={form.formState.isSubmitting}
                >
                  更新
                </Button>
              )}
            />
          }
        />
      </Form.Container>
    </Form>
  );
};

export default Page;
