import { FormTextInput } from "@/components"
import { extractInteractivity, FormInteractivity } from "@/hooks"
import { Box } from "@mantine/core"
import { z } from "zod"

export const profileInputFormSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().nonempty(),
})

export type ProfileInputFormSchema = z.infer<typeof profileInputFormSchema>

export const profileInputFormDefaultValue: ProfileInputFormSchema = {
  name: "",
  email: "",
}

export interface ProfileInputFormProps extends FormInteractivity {}

export const ProfileInputForm = (props: ProfileInputFormProps) => {
  const {} = props
  const interactivity = extractInteractivity(props)
  return (
    <Box>
      <FormTextInput
        name="name"
        placeholder="John Doe"
        label="Name"
        withAsterisk
        size="xs"
        {...interactivity}
      />
      <FormTextInput
        name="email"
        placeholder="john.doe@memoria.com"
        label="E-mail"
        withAsterisk
        size="xs"
        {...interactivity}
      />
    </Box>
  )
}
