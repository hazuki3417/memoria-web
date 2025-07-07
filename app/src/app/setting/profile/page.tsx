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
import { Button } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import {
  useMutationNotifier,
  useQueryNotifier,
  useSetFormDataFromQuery,
} from "@/hooks";

const Page = () => {
  const query = useGetUserProfileQuery();
  const [updateProfileMutation, mutation] = useUpdateProfileMutation();

  useQueryNotifier({ ...query });
  useMutationNotifier({ ...mutation });

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

  const submit = form.handleSubmit(async (value) => {
    try {
      await updateProfileMutation({
        variables: {
          input: {
            name: value.name,
            email: value.email,
            picture:
              "https://lh3.googleusercontent.com/a/ACg8ocKIWVfiXpZwpTYPahJMVMWgY4FXh3_tEC_FVoSCPrb0jnprqSxr=s96-c",
          },
        },
      });
    } catch (e) {
      console.error("更新失敗:", e);
    }
  });

  return (
    <Form>
      <Form.Container>
        <Form.LoadingOverlay visible={query.loading} />
        <FormProvider {...form}>
          <Form.Group onSubmit={submit}>
            <ProfileInputForm />
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
