import { DEFAULT_THEME, createTheme, mergeMantineTheme } from "@mantine/core"

declare module "@mantine/core" {
  export interface MantineThemeOther {
    // App内で利用する定数の型定義
    app: {
      header: {
        height: number
      }
    }
  }
}

export const override = createTheme({
  primaryColor: "gray",
  components: {
    /**
     * NOTE: アプリケーション固有のデフォルトスタイルはここで初期値を指定して統一する。
     *       UIガードレールデザイン層（compoenets/ui~は必要ないかも）
     * FIX: 下記のコードを有効にするとSSRでりようできなくなるため廃止する
     */
    // ActionIcon: ActionIcon.extend({
    //   defaultProps: {
    //     variant: "subtle",
    //   },
    // }),
    // Radio: Radio.extend({
    //   defaultProps: {
    //     size: "xs",
    //   },
    // }),
    // RadioGroup: RadioGroup.extend({
    //   defaultProps: {
    //     size: "xs",
    //   },
    // }),
    // Text: Text.extend({
    //   defaultProps: {
    //     size: "xs",
    //   },
    // }),
    // TagsInput: TagsInput.extend({
    //   defaultProps: {
    //     size: "xs",
    //   },
    // }),
  },
  // App内で利用する定数
  other: {
    app: {
      header: {
        height: 40,
      },
    },
  },
})

export const theme = mergeMantineTheme(DEFAULT_THEME, override)
