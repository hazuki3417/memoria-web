/**
 * CSR専用
 */
import { useCallback, useEffect, useState } from "react";
import { setLang as setLangCookie } from "./setLang";
import { config } from "./config";
import Cookie from "universal-cookie";

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
      cookie.get(config.cookie.name) ||
      navigator.language?.split("-")[0] || // "en-US" → "en"
      config.default.lang
    );
  });

  useEffect(() => {
    const stored = cookie.get(config.cookie.name);
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
