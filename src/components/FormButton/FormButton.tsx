import { useFormContext } from "react-hook-form"
import { Button, ButtonProps } from "@mantine/core"
import React from "react"

export interface FormButtonProps extends Omit<ButtonProps, "disabled"> {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"]
  form?: React.ButtonHTMLAttributes<HTMLButtonElement>["form"]
}

export const FormButton = (props: FormButtonProps) => {
  const { ...lest } = props
  const { formState } = useFormContext()

  return <Button {...lest} disabled={formState.isSubmitting} />
}
