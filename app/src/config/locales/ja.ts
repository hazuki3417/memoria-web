import { TranslationSchema } from "./type";

export const ja: TranslationSchema = {
  auth: {
    signIn: "サインイン",
    signUp: "サインアップ",
    signOut: "サインアウト",
  },
  hello: "おはよう",
  validate: {
    file: {
      size: {
        tooLarge: "ファイルサイズが上限 {{maxSize}}{{unit}} を超えています。",
        tooSmall: "ファイルサイズが下限 {{minSize}}{{unit}} 未満です。",
        unreadable: "ファイルサイズを読み取ることができませんでした。",
      },
      type: {
        unsupported: "サポートされていないファイル形式です。",
        invalid: "無効なファイル形式です。",
        missing: "ファイル形式を判別できませんでした。",
      },
      tooManyFiles: "アップロードできるファイルは最大 {{max}} 件までです。",
    },
  },
};
