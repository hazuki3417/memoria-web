"use client"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { ImageInputFormValues } from "./ImageInputFormSchema"

export const useImageTagBulkAction = () => {
  const { getValues, setValue } = useFormContext<ImageInputFormValues>()

  const add = useCallback(
    (tags: string[]) => {
      const images = getValues("images")
      images.forEach((image, index) => {
        if (!image.selected) {
          return // NOTE: 未選択の場合は反映しない
        }
        setValue(`images.${index}.tags`, [...new Set([...image.tags, ...tags])])
      })
    },
    [getValues, setValue],
  )

  const remove = useCallback(
    (tags: string[]) => {
      const images = getValues("images")
      images.forEach((image, index) => {
        if (!image.selected) {
          return // NOTE: 未選択の場合は反映しない
        }
        setValue(
          `images.${index}.tags`,
          image.tags.filter((tag) => !tags.includes(tag)),
        )
      })
    },
    [getValues, setValue],
  )

  const replace = useCallback(
    (tags: string[]) => {
      const images = getValues("images")
      images.forEach((image, index) => {
        if (!image.selected) {
          return // NOTE: 未選択の場合は反映しない
        }
        setValue(`images.${index}.tags`, tags)
      })
    },
    [getValues, setValue],
  )

  return {
    add,
    remove,
    replace,
  }
}
