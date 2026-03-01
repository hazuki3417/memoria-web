"use client"
import { InfoPayload } from "@/feature/ImageDetailModal/Info"
import { UseDisclosureStatus } from "@/hooks"
import "client-only"
import { createContext } from "react"

// NOTE: UI/APIの中間となるデータ構造を表現する型
//       UI側はサムネイル、プレビューを表示したかったりaltがひつようになる
//       API側はaltがなかったりする
//       またUI側はサムネイルアイテムで使いたい情報や、画像詳細で使いたい情報両方含める必要もある
//       （サムネイル一覧と画像詳細を兼用した配列のイメージ）
export type ImageDetailPayload = {
  id: string
  info: InfoPayload
  image: {
    preview: string
    thumbnail: string
    alt: string
  }
}

export type ImageDetail = {
  id: string
  getImages: (() => ImageDetailPayload[]) | null
}

export interface ImageDetailModalValue {
  modal: {
    opened: UseDisclosureStatus
  }
}

export interface ImageDetailModalControl {
  open: (params: { id: string; getImages: () => ImageDetailPayload[] }) => void
  close: () => void
}

// export interface ImageDetailModalAction {}

export type ImageDetailModalContext = {
  value: ImageDetailModalValue
  control: ImageDetailModalControl
  // action: ImageDetailModalAction
}

export const ImageDetailModalContext = createContext<
  ImageDetailModalContext | undefined
>(undefined)
