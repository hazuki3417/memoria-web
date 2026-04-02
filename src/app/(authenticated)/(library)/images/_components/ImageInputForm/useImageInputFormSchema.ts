"use client"
import { Limit } from "@/types/limit"
import { useMemo } from "react"
import { imageInputFormSchema } from "./ImageInputFormSchema"

export const useImageInputFormSchema = (limit: Limit) => {
  return useMemo(() => {
    return imageInputFormSchema({
      image: {
        file: {
          type: limit.upload.file.type,
          size: {
            max: limit.upload.file.size,
          },
        },
        tags: { count: { max: limit.upload.tag.count } },
      },
      count: {
        max: limit.upload.file.count,
      },
    })
  }, [limit])
}
