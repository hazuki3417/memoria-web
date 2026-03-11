import { FileSizePrefix } from "@/lib/transform"

export type Preference = {
  file: {
    dateFormat: string
    fileSizeUnit: FileSizePrefix
  }
  thumbnail: {
    size: number
    spacing: number
  }
  preview: {
    loop: boolean
    show: boolean
  }
}
