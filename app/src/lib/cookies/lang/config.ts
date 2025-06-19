export const config = {
  default: {
    lang: "ja",
  },
  header: {
    name: "accept-language",
  },
  cookie: {
    name: "lang",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30日
  },
};
