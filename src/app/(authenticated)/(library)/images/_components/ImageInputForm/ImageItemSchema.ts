"use client"
import { ze } from "@/lib"
import z from "zod"

export type FileSchemaConfig = {
  type: string[]
  size: {
    max: number
  }
}

export const fileSchema = (config: FileSchemaConfig) => {
  return ze.refine(
    z.custom<File>((file) => file instanceof File),
    [
      // ze.verify.file.type(config.type),
      ze.verify.file.size.tooLarge(config.size.max),
    ],
  )
}

export type TagsSchemaConfig = {
  count: {
    max: number
  }
}

export const tagsSchema = (config: TagsSchemaConfig) => {
  return z.array(z.string()).max(config.count.max)
}

export type ImageSchemaConfig = {
  file: FileSchemaConfig
  tags: TagsSchemaConfig
}
export const imageSchema = (config: ImageSchemaConfig) => {
  return z.object({
    taskId: z.string(),
    selected: z.boolean(),
    file: fileSchema(config.file),
    tags: tagsSchema(config.tags),
  })
}

export type ImageValues = z.infer<ReturnType<typeof imageSchema>>

export type ImageItemSchemaConfig = {
  image: ImageSchemaConfig
  count: {
    max: number
  }
}

export const imageItemSchema = (config: ImageItemSchemaConfig) => {
  return z.object({
    images: z.array(imageSchema(config.image)).max(config.count.max),
  })
}

export type ImageItemValues = z.infer<ReturnType<typeof imageItemSchema>>
