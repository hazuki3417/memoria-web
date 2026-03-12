"use client"
import { CustomModal } from "@/components"
import { ImageDetailModal } from "@/feature"
import { useDeleteImageMutation, useDownloadImageMutation } from "@/graphql"
import { useDisclosure, usePreference } from "@/hooks"
import { action } from "@/lib/action"
import { useConfirmContext, useFeedbackContext } from "@/providers"
import "client-only"
import React, { useCallback, useMemo, useState } from "react"
import {
  ImageDetail,
  ImageDetailModalContext,
  ImageDetailPayload,
} from "./ImageDetailModalContext"

export interface ImageDetailModalProviderProps {
  children: React.ReactNode
}

export const ImageDetailModalProvider = (
  props: ImageDetailModalProviderProps,
) => {
  const { children } = props

  const preference = usePreference()
  const feedback = useFeedbackContext()
  const confirm = useConfirmContext()
  const disclosure = useDisclosure({ status: "closed" })
  const [imageDetail, setImageDetail] = useState<ImageDetail>({
    id: "",
    getImages: null,
  })

  const handleOpen = useCallback(
    (params: { id: string; getImages: () => ImageDetailPayload[] }) => {
      disclosure.control.open()
      setImageDetail({
        ...params,
      })
    },
    [disclosure],
  )

  const handleClose = useCallback(() => {
    disclosure.control.close()
  }, [disclosure])

  const images = imageDetail.getImages?.() ?? []
  const current = images.findIndex((image) => image.id === imageDetail.id)
  const length = images.length
  const image = images.find((image) => image.id === imageDetail.id)
  const loop = false
  // const loop = preference.preview.loop

  const next = useMemo(() => {
    const next = current + 1
    const last = next === length
    return {
      index: next,
      last,
    }
  }, [current, length])

  const prev = useMemo(() => {
    const prev = current - 1
    const first = prev <= 0
    return {
      index: prev,
      first,
    }
  }, [current, length])

  const [deleteImage] = useDeleteImageMutation({
    update(cache, { data }) {
      const id = data?.deleteImage.id
      cache.evict({
        id: cache.identify({ __typename: "Image", id }),
      })
      cache.gc()
    },
  })

  const [downloadImage] = useDownloadImageMutation()

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await confirm.action.confirm({
        body: "削除します。よろしいですか？",
      })

      if (result !== "confirmed") {
        return
      }
      await deleteImage({
        variables: {
          input: { id },
        },
      })
      feedback.action.success({
        title: "成功",
        body: "削除しました。",
      })
      handleClose()
    },
    [confirm, deleteImage, feedback],
  )

  const handleDownload = useCallback(
    async (id: string) => {
      const res = await downloadImage({
        variables: {
          input: { id },
        },
      })

      if (!res.data) {
        return
      }

      const downloadUrl = res.data.downloadImage
      action.download({
        url: downloadUrl.url,
        fileName: downloadUrl.fileName,
      })
    },
    [downloadImage],
  )

  const handleEdit = (id: string) => {}

  const handleNext = () => {
    if (loop) {
      const image = next.last ? images[0] : images[next.index]
      handleOpen({ id: image.id, getImages: () => images })
      return
    }

    if (next.last) {
      return
    }

    const image = images[next.index]
    handleOpen({ id: image.id, getImages: () => images })
  }

  const handlePrev = () => {
    if (loop) {
      const image = prev.first ? images[length - 1] : images[prev.index]
      handleOpen({ id: image.id, getImages: () => images })
      return
    }

    if (prev.first) {
      return
    }

    const image = images[prev.index]
    handleOpen({ id: image.id, getImages: () => images })
  }

  return (
    <ImageDetailModalContext.Provider
      value={{
        value: { modal: { opened: disclosure.value.status } },
        control: {
          open: handleOpen,
          close: handleClose,
        },
      }}
    >
      {children}
      {image !== undefined && (
        <CustomModal
          opened={disclosure.value.status === "opened"}
          onClose={handleClose}
        >
          <ImageDetailModal
            config={{
              fileSizePrefix: preference.file.fileSizeUnit,
              showInfoByDefault: preference.preview.show,
            }}
            ui={{
              showPrev: loop ? true : !prev.first,
              showNext: loop ? true : !next.last,
            }}
            payload={{
              slide: {
                current: current + 1,
                limit: length,
              },
              info: {
                file: {
                  name: image.info.file.name,
                  size: image.info.file.size,
                  date: image.info.file.date,
                },
                image: {
                  width: image.info.image.width,
                  height: image.info.image.height,
                },
                tags: image.info.tags,
              },
              preview: {
                src: image.image.preview,
                alt: image.info.file.name,
              },
            }}
            handler={{
              onClose: handleClose,
              onDelete: () => handleDelete(image.id),
              onDownload: () => handleDownload(image.id),
              onEdit: () => handleEdit(image.id),
              onNext: handleNext,
              onPrev: handlePrev,
            }}
          />
        </CustomModal>
      )}
    </ImageDetailModalContext.Provider>
  )
}

export function findWithIndex<T>(
  items: T[],
  predicate: (item: T, index: number, array: T[]) => boolean,
): { index: number; item: T | undefined } {
  const index = items.findIndex(predicate)

  return {
    index,
    item: index === -1 ? undefined : items[index],
  }
}
