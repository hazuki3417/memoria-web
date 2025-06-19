/**
 * CSR/SSR共用
 */
import { langConfig } from "@/config";
import Cookie from "universal-cookie";

const cookie = new Cookie();

export const setLang = (value: string) => {
  cookie.set(langConfig.cookie.name, value, {
    path: langConfig.cookie.path,
    maxAge: langConfig.cookie.maxAge,
  });
};
