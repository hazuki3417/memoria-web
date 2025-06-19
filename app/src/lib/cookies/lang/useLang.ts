/**
 * CSR専用
 */
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

export type UseLangState = {
  value: string;
};

export interface UseLangHandler {
  set: (value: string) => void;
}
export interface UseLang {
  state: UseLangState;
  handler: UseLangHandler;
}

export const useLang = (): UseLang => {
  const { i18n } = useTranslation();

  const set = useCallback((value: string) => {
    i18n.changeLanguage(value);
  }, []);

  const lang = useMemo(() => {
    return i18n.language.split(",")[0].split("-")[0];
  }, [i18n.language]);

  return {
    state: { value: lang },
    handler: {
      set,
    },
  };
};
