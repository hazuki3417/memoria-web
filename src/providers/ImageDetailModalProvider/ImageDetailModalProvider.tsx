"use client"
import { CustomModal } from "@/components"
import { ImageDetailModal } from "@/feature"
import { useDeleteImageMutation, useDownloadImageMutation } from "@/graphql"
import {
  useCollectionNavigation,
  useCollectionPreload,
  useDisclosure,
  usePreference,
} from "@/hooks"
import { action } from "@/lib/action"
import { transform } from "@/lib/transform"
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

  const nav = useCollectionNavigation({
    items: images,
    predicate: (image) => image.id === imageDetail.id,
    loop: preference.preview.loop,
  })

  useCollectionPreload({
    items: images,
    index: nav.current.index,
    loop: nav.loop,
    distance: 2,
    getSrc: (item) => item.image.preview,
  })

  const [deleteImage] = useDeleteImageMutation({
    update(cache, { data }) {
      const id = data?.deleteImage.id
      cache.evict({
        id: cache.identify({ __typename: "Image", id }),
      })
      cache.gc()
    },
  })

  const handleDelete = useCallback(async () => {
    if (!nav.current.exists) {
      return
    }
    const result = await confirm.action.confirm({
      body: "削除します。よろしいですか？",
    })

    if (result !== "confirmed") {
      return
    }
    await deleteImage({
      variables: {
        input: { id: nav.current.item.id },
      },
    })
    feedback.action.success({
      title: "成功",
      body: "削除しました。",
    })
    handleClose()
  }, [nav.current, confirm, deleteImage, feedback])

  const [downloadImage] = useDownloadImageMutation()
  const handleDownload = useCallback(async () => {
    if (!nav.current.exists) {
      return
    }
    const res = await downloadImage({
      variables: {
        input: { id: nav.current.item.id },
      },
    })

    if (!res.data) {
      return
    }

    const downloadUrl = res.data.downloadImage
    action.download({
      url: downloadUrl.url,
      fileName: downloadUrl.name,
    })
  }, [nav.current, downloadImage])

  const handleEdit = () => { }

  const handleNext = () => {
    if (nav.next.exists) {
      handleOpen({ id: nav.next.item.id, getImages: () => images })
    }
  }

  const handlePrev = () => {
    if (nav.prev.exists) {
      handleOpen({ id: nav.prev.item.id, getImages: () => images })
    }
  }

  const showLoopButton = useMemo(() => {
    if (images.length === 1) {
      // 1件のみ場合はページ送りのボタンを表示しない
      return {
        showPrev: false,
        showNext: false,
      }
    }
    // 1件より大きい場合は設定に従ってページ送りのボタンを表示する
    return {
      showPrev: nav.prev.exists,
      showNext: nav.next.exists,
    }
  }, [images, nav])

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
      {nav.current.exists && (
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
              ...showLoopButton,
            }}
            payload={{
              slide: {
                current: nav.current.index + 1,
                limit: nav.length,
              },
              info: {
                file: {
                  // FIX: ファイルサイズの変換はコンポーネント内ではなくここで行うようにしたい
                  name: nav.current.item.info.file.name,
                  size: nav.current.item.info.file.size,
                  date: transform.date(
                    nav.current.item.info.file.date,
                    "Asia/Tokyo",
                    "yyyy/MM/dd HH:mm:ss",
                  ),
                },
                image: {
                  width: nav.current.item.info.image.width,
                  height: nav.current.item.info.image.height,
                },
                tags: nav.current.item.info.tags,
              },
              preview: {
                src: nav.current.item.image.preview,
                alt: nav.current.item.info.file.name,
              },
            }}
            handler={{
              onClose: handleClose,
              onDelete: handleDelete,
              onDownload: handleDownload,
              onEdit: handleEdit,
              onNext: handleNext,
              onPrev: handlePrev,
            }}
          />
        </CustomModal>
      )}
    </ImageDetailModalContext.Provider>
  )
}
