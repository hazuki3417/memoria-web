import { TranslationSchema } from "./type"

export const ja: TranslationSchema = {
  button: {
    group: "グループ",
    search: "検索",
    new: "新規",
    delete: "削除",
    edit: "編集",
    download: "ダウンロード",
    create: "作成",
    update: "更新",
    register: "登録",
    add: "追加",
    remove: "削除",
    replace: "置換",
  },
  placeholder: {
    tag: "タグ",
    group: "グループ名",
  },
  label: {
    list: "リスト",
    group: "グループ",
    filter: "絞り込み",
    bulk: "一括操作",
  },
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
}
