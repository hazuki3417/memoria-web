import { ImageFieldsFragment } from "@/graphql"
import { ImageDetailPayload } from "@/providers"
import { Mapper } from "../types"

/**
 * API -> ImageDetailPayload
 */
export const imageDetailPayloadMapper: Mapper<
  ImageFieldsFragment,
  ImageDetailPayload
> = (item) => ({
  id: item.id,
  info: {
    file: {
      name: item.file.name,
      size: item.file.size,
      date: item.createdAt,
    },
    image: {
      width: item.size.width,
      height: item.size.height,
    },
    tags: item.tags,
  },
  image: {
    alt: item.file.name,
    preview: item.src.preview,
    thumbnail: item.src.thumbnail,
  },
})
