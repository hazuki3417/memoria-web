import React from "react";
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: (Story) => (
    <Story />
  ),
};

/**
 * コンポーネントが依存する要素はDecoratorFunctionを使ってラップする。
 * 基本的にすべてのコンポーネントが依存する要素はないため、各コンポーネント側で定義するか、stroybookファイルで設定すること。
 * 例）react-hook-formのFormProviderはuse~を使うコンポーネントのみに必要なため、そのコンポーネントのstorybookファイルで設定する。
 */

export default preview;
