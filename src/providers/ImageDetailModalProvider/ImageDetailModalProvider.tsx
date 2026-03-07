"use client"
import { CustomModal } from "@/components"
import { ImageDetailModal } from "@/feature"
import { useDeleteImageMutation, useDownloadImageMutation } from "@/graphql"
import { useDisclosure } from "@/hooks"
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
              onDelete: async () => {
                const result = await confirm.action.confirm({
                  body: "削除します。よろしいですか？",
                })

                if (result !== "confirmed") {
                  return
                }
                await deleteImage({
                  variables: {
                    input: { id: image.id },
                  },
                })
                feedback.action.success({
                  title: "成功",
                  body: "削除しました。",
                })
                handleClose()
              },
              onDownload: async () => {
                const res = await downloadImage({
                  variables: {
                    input: { id: image.id },
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
              onEdit: () => {},
              onNext: () => {
                const next = images[current + 1]
                handleOpen({ id: next.id, getImages: () => images })
              },
              onPrev: () => {
                const prev = images[current - 1]
                handleOpen({ id: prev.id, getImages: () => images })
              },
            }}
          />
        </CustomModal>
      )}
    </ImageDetailModalContext.Provider>
  )
}
