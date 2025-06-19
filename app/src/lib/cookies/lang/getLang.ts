"use server";

/**
 * SSR専用
 */
import { headers } from "next/headers";
import Cookie from "universal-cookie";
import { config } from "./config";

export const getLang = async () => {
  const cookieHeader = (await headers()).get("cookie") || "";
  const cookie = new Cookie(cookieHeader);

  const lang = {
    cookie: cookie.get(config.cookie.name),
    header: (await headers()).get(config.header.name),
  };

  return (
    lang.cookie ||
    lang.header?.split(",")[0].split("-")[0] ||
    config.default.lang
  );
};
