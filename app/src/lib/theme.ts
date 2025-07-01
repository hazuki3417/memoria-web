import {
  ActionIcon,
  DEFAULT_THEME,
  List,
  Radio,
  RadioGroup,
  TagsInput,
  Text,
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
    Radio: Radio.extend({
      defaultProps: {
        size: "xs",
      },
    }),
    RadioGroup: RadioGroup.extend({
      defaultProps: {
        size: "xs",
      },
    }),
    Text: Text.extend({
      defaultProps: {
        size: "xs",
      },
    }),
    TagsInput: TagsInput.extend({
      defaultProps: {
        size: "xs",
      },
    }),
    List: List.extend({
      defaultProps: {
        style: {
          listStyle: "none",
        },
      },
    }),
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, override);
