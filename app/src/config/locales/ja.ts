export const ja = {
  greeting: {
    hello: "Hello",
    goodbye: "Goodbye",
  },
} as const;

export type TranslationJaKeys = keyof (typeof ja)["greeting"];
