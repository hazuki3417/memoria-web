import { Preference } from "@/types/preference"

export const preferenceConfig: Preference = {
  file: {
    dateFormat: "",
    fileSizeUnit: "SI",
  },
  thumbnail: {
    size: 160,
    spacing: 8,
  },
  preview: {
    loop: false,
    show: false,
  },
}
