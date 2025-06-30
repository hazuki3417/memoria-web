import type React from "react";
import "@mantine/core/styles.css";
import { useMantineColorScheme } from "@mantine/core";
import { addons } from "@storybook/preview-api";
import { useEffect } from "react";
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode";
import Providers from "@/app/Providers";

const channel = addons.getChannel();

function ColorSchemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setColorScheme } = useMantineColorScheme();
  const handleColorScheme = (value: boolean) =>
    setColorScheme(value ? "dark" : "light");

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
    <Providers
      auth={{
        isSignIn: false,
        auth: { user: undefined },
        app: { user: undefined },
      }}
      option={{ graphql: { token: undefined } }}
    >
      {renderStory()}
    </Providers>
  ),
];
