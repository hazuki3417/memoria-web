import { FormTextInput } from "@/components/FormTextInput";
import { Box, TextInput } from "@mantine/core";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

export const profileInputFormSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().nonempty(),
});

export type ProfileInputFormSchema = z.infer<typeof profileInputFormSchema>;

export const profileInputFormDefaultValue: ProfileInputFormSchema = {
  name: "",
  email: "",
};

export interface ProfileInputFormProps {}

export const ProfileInputForm = (props: ProfileInputFormProps) => {
  return (
    <Box>
      <FormTextInput
        name="name"
        placeholder="John Doe"
        label="Name"
        withAsterisk
        size="xs"
      />
      <FormTextInput
        name="email"
        placeholder="john.doe@memoria.com"
        label="E-mail"
        withAsterisk
        size="xs"
      />
    </Box>
  );
};
