"use client"
import { CustomModal } from "@/components/Modal/CustomModal/CustomModal"
import { ImageDetailModal } from "@/components/Modal/ImageDetailModal"
import { useImageDetailModalContext } from "@/providers"
import "client-only"

export interface AppShellModalProps {}

export const AppShellModal = (props: AppShellModalProps) => {
  const { value, control, action } = useImageDetailModalContext()

  return (
    <>
      <CustomModal
        opened={value.modal.opened === "opened"}
        onClose={control.close}
      >
        <ImageDetailModal
          payload={{
            slide: {
              current: 1,
              limit: 20,
            },
            info: {
              file: {
                name: "example.png",
                size: "24.5MB",
                date: "2025/01/01",
              },
              image: {
                width: 1200,
                height: 1000,
              },
              tags: ["SAO", "ジークアクス", "Fate"],
            },
          }}
          handler={{
            onClose: control.close,
          }}
        />
      </CustomModal>
    </>
  )
}
