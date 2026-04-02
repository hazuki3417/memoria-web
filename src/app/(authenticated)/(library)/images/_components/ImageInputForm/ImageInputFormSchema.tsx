"use client"
import { z } from "zod"
import {
  imageItemSchema,
  ImageItemSchemaConfig,
  tagsSchema,
} from "./ImageItemSchema"

export type ImageInputFormSchemaConfig = ImageItemSchemaConfig
export const imageInputFormSchema = (config: ImageInputFormSchemaConfig) => {
  return z.object({
    bulk: z.object({
      reflection: z.boolean(),
      tags: tagsSchema(config.image.tags),
    }),
    ...imageItemSchema(config).shape,
  })
}

export type ImageInputFormValues = z.infer<
  ReturnType<typeof imageInputFormSchema>
>
