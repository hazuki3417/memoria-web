/**
 * CSR専用
 */
import { useCallback, useEffect, useState } from "react";
import { setLang as setLangCookie } from "./setLang";
import Cookie from "universal-cookie";
import { langConfig } from "@/config";

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
  const cookie = new Cookie();

  const [lang, setLangState] = useState<string>(() => {
    return (
      cookie.get(langConfig.cookie.name) ||
      navigator.language?.split("-")[0] || // "en-US" → "en"
      langConfig.default.lang
    );
  });

  useEffect(() => {
    const stored = cookie.get(langConfig.cookie.name);
    if (stored && stored !== lang) {
      setLangState(stored);
    }
  }, []);

  const set = useCallback((value: string) => {
    setLangCookie(value);
    setLangState(value);
  }, []);

  return {
    state: { value: lang },
    handler: {
      set,
    },
  };
};
