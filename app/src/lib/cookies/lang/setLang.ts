/**
 * CSR/SSR共用
 */
import Cookie from "universal-cookie";
import { config } from "./config";

const cookie = new Cookie();

export const setLang = (value: string) => {
  cookie.set(config.cookie.name, value, {
    path: config.cookie.path,
    maxAge: config.cookie.maxAge,
  });
};
