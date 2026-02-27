import { TranslationSchema } from "@/config/locales"

/**
 * TranslationSchemaに定義されているオブジェクトのパス文字列を生成する型定義
 */
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never

type Paths<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object ? Join<K, Paths<T[K]>> : K
    }[keyof T]
  : never

export type TranslationSchemaKey = Paths<TranslationSchema>
