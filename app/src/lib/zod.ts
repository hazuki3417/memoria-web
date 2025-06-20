import { z, type ZodType } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import { TranslationSchemaKey } from "./type";

z.setErrorMap(zodI18nMap);

/**
 * messageに指定する値を型推論で指定できるようにするutil
 * i18nで定義したkeyでバリデーションメッセージを指定する実装を提供する
 */
export type RefineCondition<T> = {
  valid: (value: T) => boolean;
  key: TranslationSchemaKey;
};

export const refine = <T>(
  schema: ZodType<T>,
  conditions: RefineCondition<T>[],
): ZodType<T> => {
  return conditions.reduce(
    (acc, { valid, key }) => acc.refine(valid, { message: key }),
    schema,
  );
};
