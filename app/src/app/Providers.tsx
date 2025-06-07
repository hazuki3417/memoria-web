"use client";
import { ApolloProvider, ThemeProvider } from "@/components";
import { theme } from "@/lib/theme";
import type React from "react";

export interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = (props: ProvidersProps) => {
  const { children } = props;
  return (
    <ThemeProvider defaultColorScheme="auto" theme={theme}>
      <ApolloProvider>{children}</ApolloProvider>
    </ThemeProvider>
  );
};
export default Providers;
