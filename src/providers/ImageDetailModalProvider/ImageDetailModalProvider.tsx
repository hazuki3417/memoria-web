"use client"
import { CustomModal } from "@/components/CustomModal/CustomModal"
import { ImageDetailModal } from "@/feature/ImageDetailModal"
import { useDisclosure } from "@/hooks"
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
              onDelete: () => { },
              onDownload: () => { },
              onEdit: () => { },
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
