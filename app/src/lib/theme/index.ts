"use client";

import { createTheme, DEFAULT_THEME, mergeMantineTheme } from "@mantine/core";

export const overrideThema = createTheme({});

export const theme = mergeMantineTheme(DEFAULT_THEME, overrideThema);
