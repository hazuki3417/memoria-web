import React from "react";
import type { Preview } from "@storybook/react";
import { MantineProvider, useMantineColorScheme } from "@mantine/core"
import { theme } from "../src/lib/theme";
import { useEffect } from 'react';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

const channel = addons.getChannel();

function ColorSchemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setColorScheme } = useMantineColorScheme();
  const handleColorScheme = (value: boolean) =>
    setColorScheme(value ? 'dark' : 'light');

  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
  }, [channel]);

  return <>{children}</>;
}

export const decorators = [
  (renderStory: any) => (
    <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>
  ),
  (renderStory: any) => (
    <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
  ),
];


const preview: Preview = {
  // parameters: {
  //   controls: {
  //     matchers: {
  //       color: /(background|color)$/i,
  //       date: /Date$/i,
  //     },
  //   },
  // },
  decorators: decorators
};

/**
 * コンポーネントが依存する要素はDecoratorFunctionを使ってラップする。
 * 基本的にすべてのコンポーネントが依存する要素はないため、各コンポーネント側で定義するか、stroybookファイルで設定すること。
 * 例）react-hook-formのFormProviderはuse~を使うコンポーネントのみに必要なため、そのコンポーネントのstorybookファイルで設定する。
 */

export default preview;
