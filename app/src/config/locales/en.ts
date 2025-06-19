export const en = {
  greeting: {
    hello: "Hello",
    goodbye: "Goodbye",
  },
} as const;

export type TranslationEnKeys = keyof (typeof en)["greeting"];
