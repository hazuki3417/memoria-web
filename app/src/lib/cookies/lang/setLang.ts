/**
 * CSR/SSR共用
 */
import Cookie from "universal-cookie";

const cookie = new Cookie();

export const setLang = (value: string) => {
  cookie.set("lang", value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30日
  });
};
