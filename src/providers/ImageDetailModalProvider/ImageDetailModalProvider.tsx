"use client"
import { CustomModal } from "@/components"
import { ImageDetailModal } from "@/feature"
import { useDeleteImageMutation, useDownloadImageMutation } from "@/graphql"
import { useDisclosure, usePreference } from "@/hooks"
import { action } from "@/lib/action"
import { useConfirmContext, useFeedbackContext } from "@/providers"
import "client-only"
import React, { useCallback, useState } from "react"
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
  const limit = images.length
  const image = images.find((image) => image.id === imageDetail.id)

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
    const length = images.length
    const next = current + 1
    const last = next === length

    const loop = preference.preview.loop
    if (loop) {
      const image = last ? images[0] : images[next]
      handleOpen({ id: image.id, getImages: () => images })
      return
    }

    if (last) {
      return
    }

    const image = images[next]
    handleOpen({ id: image.id, getImages: () => images })
  }

  const handlePrev = () => {
    const length = images.length
    const prev = current - 1
    const first = prev <= 0

    const loop = preference.preview.loop
    if (loop) {
      const image = first ? images[length - 1] : images[prev]
      handleOpen({ id: image.id, getImages: () => images })
      return
    }

    if (first) {
      return
    }

    const image = images[prev]
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
            payload={{
              slide: {
                current: current + 1,
                limit,
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
