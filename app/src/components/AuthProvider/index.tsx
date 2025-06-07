"use client";
import {
  UserProvider,
  type UserProviderProps,
} from "@auth0/nextjs-auth0/client";
import type { FC } from "react";

type Props = Pick<UserProviderProps, "children">;

const AuthProvider: FC<Props> = (props) => {
  const { children } = props;
  return <UserProvider>{children}</UserProvider>;
};

export default AuthProvider;
