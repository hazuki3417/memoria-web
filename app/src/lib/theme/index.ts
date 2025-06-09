import { DEFAULT_THEME, createTheme, mergeMantineTheme } from "@mantine/core";

export const override = createTheme({});

export const theme = mergeMantineTheme(DEFAULT_THEME, override);
