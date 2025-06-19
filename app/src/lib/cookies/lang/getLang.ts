"use server";

/**
 * SSR専用
 */
import { headers } from "next/headers";
import Cookie from "universal-cookie";

export const getLang = async () => {
  const cookieHeader = (await headers()).get("cookie") || "";
  const cookie = new Cookie(cookieHeader);

  const lang = {
    cookie: cookie.get("lang"),
    header: (await headers()).get("accept-language"),
  };

  const defaultLang = "ja";

  return lang.cookie || lang.header?.split(",")[0].split("-")[0] || defaultLang;
};
