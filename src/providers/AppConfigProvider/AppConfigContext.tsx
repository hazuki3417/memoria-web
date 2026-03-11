"use client"
import { FileSizePrefix } from "@/lib/transform"
import "client-only"
import { createContext } from "react"

export type AppConfigContext = {
  limit: {
    upload: {
      file: {
        count: number
        size: number
        type: string[]
      }
      tag: {
        count: number
      }
    }
  }
  preference: {
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
}

export const AppConfigContext = createContext<AppConfigContext | undefined>(undefined)
