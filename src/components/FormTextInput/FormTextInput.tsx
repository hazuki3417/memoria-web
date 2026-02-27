import { useFormContext, Controller } from "react-hook-form"
import { TextInput, TextInputProps } from "@mantine/core"

export interface FormTextInputProps extends TextInputProps {
  name: string
}

export const FormTextInput = (props: FormTextInputProps) => {
  const { name, disabled, ...lest } = props
  const { control, formState } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextInput
          {...field}
          {...lest}
          disabled={disabled || formState.isSubmitting}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
