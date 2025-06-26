"use client";
import { User as AppUser } from "@/graphql";
import { CreateGraphQLOption } from "@/lib/graphql/type";
import {
  AuthContext,
  AuthProvider,
  GraphQLProvider,
  LangProvider,
  ThemeProvider,
} from "@/providers";
import type React from "react";
import { memo } from "react";
export interface ProvidersProps extends AuthContext {
  option: {
    graphql: CreateGraphQLOption;
  };
  children: React.ReactNode;
}

const MemoGraphQLProvider = memo(GraphQLProvider);

const Providers = (props: ProvidersProps) => {
  const { auth, app, option, children } = props;
  return (
    <ThemeProvider defaultColorScheme="auto">
      <LangProvider>
        <AuthProvider value={{ auth, app }}>
          <MemoGraphQLProvider option={option.graphql}>
            {children}
          </MemoGraphQLProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
};
export default Providers;
