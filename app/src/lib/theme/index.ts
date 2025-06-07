"use client";

import { DEFAULT_THEME, createTheme, mergeMantineTheme } from "@mantine/core";

export const overrideThema = createTheme({});

export const theme = mergeMantineTheme(DEFAULT_THEME, overrideThema);
