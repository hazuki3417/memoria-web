"use client";
import { CreateGraphQLOption } from "@/lib/graphql/type";
import {
  AuthProvider,
  GraphQLProvider,
  LangProvider,
  ThemeProvider,
} from "@/providers";
import { User } from "@auth0/nextjs-auth0/types";
import type React from "react";
import { memo } from "react";
export interface ProvidersProps {
  user: User | undefined;
  option: {
    graphql: CreateGraphQLOption;
  };
  children: React.ReactNode;
}

const MemoGraphQLProvider = memo(GraphQLProvider);

const Providers = (props: ProvidersProps) => {
  const { user, option, children } = props;
  return (
    <ThemeProvider defaultColorScheme="auto">
      <LangProvider>
        <AuthProvider value={user}>
          <MemoGraphQLProvider option={option.graphql}>
            {children}
          </MemoGraphQLProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
};
export default Providers;
