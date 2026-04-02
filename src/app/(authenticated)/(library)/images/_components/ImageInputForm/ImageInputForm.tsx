import { FormMode, FormModeSwitch } from "@/components"
import React, { memo } from "react"
import {
  FieldErrors,
  FieldValues,
  FormProvider,
  UseFormReturn,
} from "react-hook-form"
import { BulkActionPanel } from "./BulkActionPanel"
import { Container } from "./Container"
import { ImageItem } from "./ImageItem"

export interface ImageInputFormProps<T extends FieldValues>
  extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  mode: FormMode
  methods: UseFormReturn<T>
  submitValid?: (values: T) => void
  submitInvalid?: (errors: FieldErrors<T>) => void
}

export const ImageInputForm = <T extends FieldValues>(
  props: ImageInputFormProps<T>,
) => {
  const {
    mode,
    methods,
    submitValid = () => {},
    submitInvalid = () => {},
    children,
    ...rest
  } = props
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(submitValid, submitInvalid)}
        {...rest}
      >
        <FormModeSwitch mode={mode}>{children}</FormModeSwitch>
      </form>
    </FormProvider>
  )
}

ImageInputForm.displayName = "ImageInputForm"
ImageInputForm.ImageItem = memo(ImageItem)
ImageInputForm.BulkActionPanel = memo(BulkActionPanel)
ImageInputForm.Container = Container
