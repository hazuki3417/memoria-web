import {
  DEFAULT_THEME,
  MantineSize,
  createTheme,
  mergeMantineTheme,
} from "@mantine/core"

declare module "@mantine/core" {
  export interface MantineThemeOther {
    // App内で利用する定数の型定義
    app: {
      header: {
        height: number
      }
      iconSize: MantineSize
    }
  }
}

export const override = createTheme({
  primaryColor: "gray",
  components: {
    /**
     * NOTE: アプリケーション固有のデフォルトスタイルはここで初期値を指定して統一する。
     *       UIガードレールデザイン層（compoenets/ui~は必要ないかも）
     * NOTE: SSRで利用できないため採用しない。
     */
  },
  // App内で利用する定数
  other: {
    app: {
      header: {
        height: 40,
      },
    },
    iconSize: {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
    },
  },
})

export const theme = mergeMantineTheme(DEFAULT_THEME, override)
