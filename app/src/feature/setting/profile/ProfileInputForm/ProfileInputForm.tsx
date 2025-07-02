import { Box, TextInput } from "@mantine/core";
import { Control, Controller } from "react-hook-form";
import { z } from "zod";

export const profileInputFormSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export type ProfileInputFormSchema = z.infer<typeof profileInputFormSchema>;

export const profileInputFormDefaultValue: ProfileInputFormSchema = {
  name: "",
  email: "",
};

export interface ProfileInputFormProps {
  control: Control<any>;
}

export const ProfileInputForm = (props: ProfileInputFormProps) => {
  const { control } = props;

  return (
    <Box>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            placeholder="John Doe"
            label="Name"
            withAsterisk
            size="xs"
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            placeholder="john.doe@memoria.com"
            label="E-mail"
            withAsterisk
            size="xs"
            {...field}
          />
        )}
      />
    </Box>
  );
};
