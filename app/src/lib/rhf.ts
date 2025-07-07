import { TFunction } from "i18next";
import { TranslationSchemaKey } from "./type";
import { ControllerFieldState } from "react-hook-form";
import { UseFormReturn, FieldValues } from "react-hook-form";

const fieldState = (fieldState: ControllerFieldState) => {
  const match = (key: TranslationSchemaKey) => {
    return fieldState.error?.message === key;
  };

  const resolver = (t: TFunction) => {
    if (fieldState.error?.message === undefined) {
      return "";
    }
    return t(fieldState.error.message as TranslationSchemaKey);
  };

  return {
    error: {
      message: {
        match,
        resolver,
      },
    },
  };
};

export const rhf = {
  fieldState,
};

/**
 * createFormSubmitHandler
 * - フォームのhandleSubmitとミューテーション実行を統合するカスタムフック
 * - TFormValuesはフォームの値の型
 */
export const createFormSubmitHandler = <TFormValues extends FieldValues>(
  form: UseFormReturn<TFormValues>,
  execute: (values: TFormValues) => Promise<any>,
) => {
  return form.handleSubmit(async (values) => {
    try {
      await execute(values);
    } catch (err) {
      console.error(err);
      // 通知はuseMutationNotifierなどで行う前提なのでここではログ出力のみ行う
    }
  });
};
