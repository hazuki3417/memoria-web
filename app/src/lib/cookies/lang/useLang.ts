/**
 * CSR専用
 */
import { useCallback, useEffect, useState } from "react";
import { setLang as setLangCookie } from "./setLang";
import Cookie from "universal-cookie";

export type UseLangState = {
  value: string;
};

export type UseLangOption = UseLangState;

export interface UseLangHandler {
  set: (value: string) => void;
  update: (value: string) => void;
}
export interface UseLang {
  state: UseLangState;
  handler: UseLangHandler;
}

export const useLang = ({ value = "ja" }: UseLangOption): UseLang => {
  const [lang, setLangState] = useState<string>(value);
  const cookie = new Cookie();

  useEffect(() => {
    const lang = cookie.get("lang");
    if (lang) {
      setLangState(lang);
    }
  }, []);

  const set = useCallback((value: string) => {
    setLangState(value);
  }, []);

  const update = useCallback((value: string) => {
    setLangCookie(value);
    setLangState(value);
  }, []);

  return {
    state: { value: lang },
    handler: {
      set,
      update,
    },
  };
};
