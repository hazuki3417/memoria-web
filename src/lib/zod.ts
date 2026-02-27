import { z, type ZodType } from "zod"
import { zodI18nMap } from "zod-i18n-map"
import { TranslationSchemaKey } from "./type"
import { validate } from "./validate"

z.setErrorMap(zodI18nMap)

/**
 * messageに指定する値を型推論で指定できるようにするutil
 * i18nで定義したkeyでバリデーションメッセージを指定する実装を提供する
 */
export type RefineCondition<T> = {
  valid: (value: T) => boolean
  key: TranslationSchemaKey
}

const refine = <T>(
  schema: ZodType<T>,
  conditions: RefineCondition<T>[],
): ZodType<T> => {
  return conditions.reduce(
    (acc, { valid, key }) => acc.refine(valid, { message: key }),
    schema,
  )
}

const file = {
  type: (type: string[]): RefineCondition<File> => ({
    valid: (file) => validate.file(file).type(type),
    key: "validate.file.type.unsupported",
  }),
  size: {
    tooLarge: (max: number): RefineCondition<File> => ({
      valid: (file) => validate.file(file).size.tooLarge(max),
      key: "validate.file.size.tooLarge",
    }),
    tooSmall: (min: number): RefineCondition<File> => ({
      valid: (file) => validate.file(file).size.tooSmall(min),
      key: "validate.file.size.tooSmall",
    }),
  },
}

export const zod = {
  refine,
  validate: {
    file,
  },
}
