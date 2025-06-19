"use client";
import { GraphQLProvider, LangProvider, ThemeProvider } from "@/providers";
import type React from "react";
import { memo } from "react";
export interface ProvidersProps {
  children: React.ReactNode;
}

const MemoGraphQLProvider = memo(GraphQLProvider);

const Providers = (props: ProvidersProps) => {
  const { children } = props;
  return (
    <ThemeProvider defaultColorScheme="auto">
      <LangProvider>
        <MemoGraphQLProvider>{children}</MemoGraphQLProvider>
      </LangProvider>
    </ThemeProvider>
  );
};
export default Providers;
