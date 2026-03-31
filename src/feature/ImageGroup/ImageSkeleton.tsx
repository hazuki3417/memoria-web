import { Skeleton, SkeletonProps } from "@mantine/core"

export interface ImageSkeletonProps extends SkeletonProps {}

export const ImageSkeleton = (props: ImageSkeletonProps) => {
  const { ...rest } = props
  return (
    <Skeleton
      {...rest}
      w="auto"
      h="auto"
      mah="100%"
      maw="100%"
      draggable={false}
    />
  )
}
ImageSkeleton.displayName = "ImageSkeletonGroup.ImageSkeleton"
