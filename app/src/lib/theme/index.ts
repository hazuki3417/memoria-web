import {
  ActionIcon,
  DEFAULT_THEME,
  createTheme,
  mergeMantineTheme,
} from "@mantine/core";

export const override = createTheme({
  components: {
    /**
     * NOTE: アプリケーション固有のデフォルトスタイルはここで初期値を指定して統一する。
     *       UIガードレールデザイン層（compoenets/ui~は必要ないかも）
     */
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        variant: "subtle",
        color: "gray",
      },
    }),
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, override);
