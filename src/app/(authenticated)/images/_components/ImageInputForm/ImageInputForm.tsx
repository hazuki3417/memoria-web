import React from "react"
import {
  FieldErrors,
  FieldValues,
  FormProvider,
  UseFormReturn,
} from "react-hook-form"
import { ImageItem } from "./ImageItem"

export interface ImageInputFormProps<T extends FieldValues>
  extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  methods: UseFormReturn<T>
  submitValid?: (values: T) => void
  submitInvalid?: (errors: FieldErrors<T>) => void
}

export const ImageInputForm = <T extends FieldValues>(
  props: ImageInputFormProps<T>,
) => {
  const {
    methods,
    submitValid = () => {},
    submitInvalid = () => {},
    ...rest
  } = props
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(submitValid, submitInvalid)}
        {...rest}
      />
    </FormProvider>
  )
}

ImageInputForm.displayName = "ImageInputForm"
ImageInputForm.ImageItem = ImageItem
