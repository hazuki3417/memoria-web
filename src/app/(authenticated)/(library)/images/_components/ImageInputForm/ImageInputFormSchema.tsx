"use client"
import { z } from "zod"
import {
  imageItemSchema,
  ImageItemSchemaConfig,
  imageTagsSchema,
} from "./ImageItemSchema"

export type ImageInputFormSchemaConfig = ImageItemSchemaConfig
export const imageInputFormSchema = (config: ImageInputFormSchemaConfig) => {
  return z.object({
    bulk: z.object({
      reflection: z.boolean(),
      tags: imageTagsSchema(config.image.tags),
    }),
    ...imageItemSchema(config).shape,
  })
}

export type ImageInputFormValues = z.infer<
  ReturnType<typeof imageInputFormSchema>
>
