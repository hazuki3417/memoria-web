import { TFunction } from "i18next";
import { TranslationSchemaKey } from "./type";
import { ControllerFieldState } from "react-hook-form";

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
