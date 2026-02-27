import { LoadingOverlay } from "@mantine/core"

export interface FormLoadingOverlayProps {
  visible: boolean
}

export const FormLoadingOverlay = (props: FormLoadingOverlayProps) => {
  const { visible } = props
  return (
    <LoadingOverlay
      visible={visible}
      zIndex={1000} // 仮の値
      overlayProps={{ radius: "sm" }}
      loaderProps={{ color: "blue", type: "oval" }}
    />
  )
}
