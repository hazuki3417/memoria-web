"use client";
import { ActionPanel } from "@/components/ActionPanel";
import { Form } from "@/components/Form";
import {
  ProfileInputForm,
  profileInputFormDefaultValue,
  profileInputFormSchema,
} from "@/feature/setting/profile/ProfileInputForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";

const Page = () => {
  const methods = useForm({
    resolver: zodResolver(profileInputFormSchema),
    mode: "onChange",
    defaultValues: {
      ...profileInputFormDefaultValue,
    },
  });

  const submit = methods.handleSubmit((value) => {
    console.debug("submit", value);
  });

  return (
    <Form>
      <FormProvider {...methods}>
        <Form.Group onSubmit={submit}>
          <ProfileInputForm control={methods.control} />
        </Form.Group>
      </FormProvider>
      <ActionPanel
        right={
          <Form.Submit button={(props) => <Button {...props}>更新</Button>} />
        }
      />
    </Form>
  );
};

export default Page;
